package com.cagongu2.be.service;

import com.cagongu2.be.dto.*;
import com.nimbusds.jwt.SignedJWT;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request) throws Exception;

    IntrospectResponse introspect(IntrospectRequest request);

    void logout(LogoutRequest request);

    AuthenticationResponse refreshToken(RefreshTokenRequest request) throws Exception;

    SignedJWT verifyToken(String token, Boolean isRefresh) throws Exception;
}
