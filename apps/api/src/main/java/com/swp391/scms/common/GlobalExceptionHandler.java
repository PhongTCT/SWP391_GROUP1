package com.swp391.scms.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============================================================
    // VALIDATION ERROR
    // ============================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(err ->
                        errors.put(
                                err.getField(),
                                err.getDefaultMessage()
                        )
                );

        ErrorResponse res = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                "Dữ liệu gửi lên không hợp lệ",
                errors
        );

        return ResponseEntity
                .badRequest()
                .body(res);
    }

    // ============================================================
    // HTTP STATUS ERROR
    // ============================================================

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex
    ) {
        int status = ex.getStatusCode().value();

        String code;

        if (status == HttpStatus.TOO_MANY_REQUESTS.value()) {
            code = "OTP_RESEND_TOO_SOON";
        } else {
            code = "HTTP_ERROR";
        }

        String message =
                ex.getReason() != null
                        ? ex.getReason()
                        : "Yêu cầu không thể thực hiện.";

        ErrorResponse res = new ErrorResponse(
                status,
                code,
                message,
                null
        );

        return ResponseEntity
                .status(status)
                .body(res);
    }

    // ============================================================
    // GENERAL ERROR
    // ============================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex
    ) {
        ErrorResponse res = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_SERVER_ERROR",
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Lỗi hệ thống",
                null
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(res);
    }
}