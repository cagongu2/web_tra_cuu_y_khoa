package com.cagongu2.be.controller;

import com.cagongu2.be.dto.auth.request.AuthenticationRequest;
import com.cagongu2.be.dto.auth.request.IntrospectRequest;
import com.cagongu2.be.dto.auth.request.LogoutRequest;
import com.cagongu2.be.dto.auth.request.RefreshTokenRequest;
import com.cagongu2.be.dto.auth.response.AuthenticationResponse;
import com.cagongu2.be.dto.auth.response.IntrospectResponse;
import com.cagongu2.be.dto.user.request.UserRequest;
import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.service.AuthenticationService;
import com.cagongu2.be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authenticate")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticated(
            @RequestBody AuthenticationRequest request
    ) throws Exception {
        AuthenticationResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @RequestBody UserRequest request
    ) throws Exception {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/introspect")
    public ResponseEntity<IntrospectResponse> introspect(
            @RequestBody IntrospectRequest request) {
        IntrospectResponse response = authenticationService.introspect(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(
            @RequestBody RefreshTokenRequest request) throws Exception {
        AuthenticationResponse response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
}
