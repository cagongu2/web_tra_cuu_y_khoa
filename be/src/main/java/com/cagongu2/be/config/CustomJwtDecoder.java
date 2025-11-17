package com.cagongu2.be.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Base64;
import java.util.Date;

@Component
@Slf4j
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Value("${jwt.issuer}")
    private String EXPECTED_ISSUER;

    private static final String TOKEN_TYPE_CLAIM = "type";
    private static final String EXPECTED_TOKEN_TYPE = "access";

    @Override
    public Jwt decode(String token) throws JwtException {
        if (token == null || token.isBlank()) {
            log.warn("Attempted to decode null or empty token");
            throw new JwtException("Token is null or empty");
        }

        try{
            // Parse JWT
            SignedJWT signedJWT = SignedJWT.parse(token);

            // Validate signature
            validateSignature(signedJWT);

            // Validate claims
            validateClaims(signedJWT.getJWTClaimsSet());

            // Return decoded JWT
            return new Jwt(
                    token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    signedJWT.getJWTClaimsSet().getExpirationTime().toInstant(),
                    signedJWT.getHeader().toJSONObject(),
                    signedJWT.getJWTClaimsSet().getClaims()
            );

        } catch (ParseException e) {
            log.error("Failed to parse JWT token", e);
            throw new JwtException("Invalid token format", e);

        } catch (JOSEException e) {
            log.error("JWT signature verification failed", e);
            throw new JwtException("Invalid token signature", e);

        } catch (JwtException e) {
            // Already logged in validation methods
            throw e;

        } catch (Exception e) {
            log.error("Unexpected error during JWT decoding", e);
            throw new JwtException("Token validation failed", e);
        }
    }

    /**
     * Validate JWT signature
     */
    private void validateSignature(SignedJWT signedJWT) throws JOSEException, JwtException {
        byte[] secretKey = Base64.getDecoder().decode(SIGNER_KEY);
        JWSVerifier verifier = new MACVerifier(secretKey);

        if (!signedJWT.verify(verifier)) {
            log.warn("JWT signature verification failed");
            throw new JwtException("Invalid token signature");
        }
    }

    /**
     * Validate JWT claims
     */
    private void validateClaims(JWTClaimsSet claims) throws JwtException, java.text.ParseException {
        // 1. Check expiration time
        Date expirationTime = claims.getExpirationTime();
        if (expirationTime == null) {
            log.warn("JWT token has no expiration time");
            throw new JwtException("Token must have expiration time");
        }

        if (expirationTime.before(new Date())) {
            log.debug("JWT token has expired at {}", expirationTime);
            throw new JwtException("Token expired");
        }

        // 2. Check issue time
        Date issueTime = claims.getIssueTime();
        if (issueTime == null) {
            log.warn("JWT token has no issue time");
            throw new JwtException("Token must have issue time");
        }

        if (issueTime.after(new Date())) {
            log.warn("JWT token issue time is in the future: {}", issueTime);
            throw new JwtException("Invalid token issue time");
        }

        // 3. Validate issuer
        String issuer = claims.getIssuer();
        if (!EXPECTED_ISSUER.equals(issuer)) {
            log.warn("JWT token has invalid issuer: {}", issuer);
            throw new JwtException("Invalid token issuer");
        }

        // 4. Validate subject (user ID must exist)
        String subject = claims.getSubject();
        if (subject == null || subject.isBlank()) {
            log.warn("JWT token has no subject");
            throw new JwtException("Token must have subject");
        }

        // 5. Validate token type (access token only in this decoder)
        Object tokenType = claims.getClaim(TOKEN_TYPE_CLAIM);
        if (tokenType == null || !EXPECTED_TOKEN_TYPE.equals(tokenType.toString())) {
            log.warn("JWT token has invalid type: {}", tokenType);
            throw new JwtException("Invalid token type");
        }
    }
}