package com.cagongu2.be.service;

import com.cagongu2.be.dto.auth.request.AuthenticationRequest;
import com.cagongu2.be.dto.auth.request.IntrospectRequest;
import com.cagongu2.be.dto.auth.request.LogoutRequest;
import com.cagongu2.be.dto.auth.request.RefreshTokenRequest;
import com.cagongu2.be.dto.auth.response.AuthenticationResponse;
import com.cagongu2.be.dto.auth.response.IntrospectResponse;
import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.mapper.UserMapper;
import com.cagongu2.be.model.RefreshToken;
import com.cagongu2.be.model.Role;
import com.cagongu2.be.model.User;
import com.cagongu2.be.repository.RefreshTokenRepository;
import com.cagongu2.be.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    private final String SIGNER_KEY;
    private final Long VALID_DURATION;
    private final Long REFRESHABLE_DURATION;
    private final String JWT_ISSUER;

    private final MetricsService metricsService;

    @Autowired
    public AuthenticationServiceImpl(UserRepository userRepository,
                                     RefreshTokenRepository refreshTokenRepository,
                                     PasswordEncoder passwordEncoder,
                                     UserMapper userMapper,
                                     @Value("${jwt.signerKey}") String SIGNER_KEY,
                                     @Value("${jwt.valid-duration}") Long VALID_DURATION,
                                     @Value("${jwt.refreshable-duration}") Long REFRESHABLE_DURATION,
                                     @Value("${jwt.issuer}") String JWT_ISSUER,
                                     MetricsService metricsService
                                     ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.SIGNER_KEY = SIGNER_KEY;
        this.VALID_DURATION = VALID_DURATION;
        this.REFRESHABLE_DURATION = REFRESHABLE_DURATION;
        this.JWT_ISSUER = JWT_ISSUER;
        this.metricsService = metricsService;
    }

    @Override
    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) throws Exception {
        try {
            var user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new Exception("User not found with username: " + request.getUsername()));

            boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

            if (!authenticated) {
                // Track failed login
                metricsService.trackLoginAttempt(false);
                throw new Exception("Invalid email or password");
            }

            if (!user.getIsActive()) {
                throw new Exception("User account is inactive");
            }

            // Track successful login
            metricsService.trackLoginAttempt(true);

            var userResponse = userMapper.toUserResponse(user);
            var accessToken = generateToken(user, userResponse.getRoleSlugs());
            var refreshToken = generateRefreshToken(user);
            RefreshToken refreshTokenEntity = RefreshToken.builder()
                    .token(refreshToken)
                    .userId(user.getId())
                    .expiryDate(LocalDateTime.now().plusSeconds(REFRESHABLE_DURATION))
                    .revoked(false)
                    .build();
            refreshTokenRepository.save(refreshTokenEntity);

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(userResponse)
                    .build();

        } catch (Exception e) {
            throw new Exception("Invalid email or password", e);
        }
    }

    private String generateToken(User user, List<String> roleSlugs) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .issuer(JWT_ISSUER)
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.HOURS)
                                .toEpochMilli()
                ))
                .claim("email", user.getEmail())
                .claim("type", "access")
                .claim("scope", buildScope(roleSlugs))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            byte[] secretKey = Base64.getDecoder().decode(SIGNER_KEY);
            jwsObject.sign(new MACSigner(secretKey));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Failed to generate access token", e);
        }
    }

    private String generateRefreshToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .issuer(JWT_ISSUER)
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + REFRESHABLE_DURATION * 1000))
                .claim("email", user.getEmail())
                .claim("type", "refresh")
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            byte[] secretKey = Base64.getDecoder().decode(SIGNER_KEY);
            jwsObject.sign(new MACSigner(secretKey));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Failed to generate refresh token", e);
        }
    }

    private String buildScope(List<String> roleSlugs) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(roleSlugs))
            roleSlugs.forEach(role -> stringJoiner.add("ROLE_" + role));

        return stringJoiner.toString();
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            verifyToken(request.getToken(), false);
            return IntrospectResponse.builder().valid(true).build();
        } catch (Exception e) {
            return IntrospectResponse.builder().valid(false).build();
        }
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenRepository.findByToken(request.getToken())
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    @Override
    @Transactional
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) throws Exception {
        try {
            SignedJWT signedJWT = verifyToken(request.getToken(), true);
            String userId = signedJWT.getJWTClaimsSet().getSubject();
            User user = userRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new Exception("User not found"));

            RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(request.getToken())
                    .orElseThrow(() -> new Exception("Invalid refresh token"));

            if (refreshTokenEntity.isRevoked() || refreshTokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new Exception("Refresh token is revoked or expired");
            }

            var userResponse = UserResponse.builder()
                    .id(user.getId())
                    .phone(user.getPhone())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .roleSlugs(user.getRoles().stream().filter(Role::getIsActive).map(Role::getSlug).toList())
                    .build();
            String newAccessToken = generateToken(user, userResponse.getRoleSlugs());
            String newRefreshToken = generateRefreshToken(user);

            refreshTokenEntity.setToken(newRefreshToken);
            refreshTokenEntity.setExpiryDate(LocalDateTime.now().plusSeconds(REFRESHABLE_DURATION));
            refreshTokenEntity.setRevoked(false);

            refreshTokenRepository.save(refreshTokenEntity);

            return AuthenticationResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .user(userResponse)
                    .build();
        } catch (Exception e) {
            throw new Exception("Failed to refresh token", e);
        }
    }

    @Override
    public SignedJWT verifyToken(String token, Boolean isRefresh) throws Exception {
        try {
            byte[] secretKey = Base64.getDecoder().decode(SIGNER_KEY);
            JWSVerifier verifier = new MACVerifier(secretKey);

            SignedJWT signedJWT = SignedJWT.parse(token);
            var verified = signedJWT.verify(verifier);

            if (!verified) {
                throw new Exception("Invalid token signature");
            }

            if (!JWT_ISSUER.equals(signedJWT.getJWTClaimsSet().getIssuer())) {
                throw new Exception("Invalid token issuer");
            }

            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiryTime.before(new Date())) {
                throw new Exception("Token expired");
            }

            String type = (String) signedJWT.getJWTClaimsSet().getClaim("type");
            if (isRefresh && !"refresh".equals(type)) {
                throw new Exception("Not a refresh token");
            } else if (!isRefresh && !"access".equals(type)) {
                throw new Exception("Not an access token");
            }

            return signedJWT;
        } catch (Exception e) {
            throw new Exception("Token verification failed", e);
        }
    }
}