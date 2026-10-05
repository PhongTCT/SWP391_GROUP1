package com.swp391.scms.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final int MAX_ATTEMPTS = 3;
    private static final int OTP_EXPIRE_SECONDS = 5 * 60;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    public record OtpEntry(
            String code,
            Instant expireAt,
            int failedAttempts
    ) {
    }

    public enum VerifyResult {
        SUCCESS,
        EXPIRED_OR_NOT_FOUND,
        INVALID_CODE,
        MAX_ATTEMPTS_EXCEEDED
    }

    public record Status(
            VerifyResult result,
            int remainingAttempts
    ) {
    }

    private final ConcurrentHashMap<String, OtpEntry> cache =
            new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, Instant> lastSentAt =
            new ConcurrentHashMap<>();

    // Sinh OTP mới.
    public synchronized String generateOtp(String target) {
        String key = target.trim().toLowerCase();
        Instant now = Instant.now();

        Instant lastSent = lastSentAt.get(key);

        // Chặn resend nếu chưa đủ 60 giây.
        if (
                lastSent != null &&
                now.isBefore(
                        lastSent.plusSeconds(
                                RESEND_COOLDOWN_SECONDS
                        )
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Vui lòng chờ 60 giây trước khi gửi lại mã OTP."
            );
        }

        // Sinh đúng 6 chữ số, kể cả mã bắt đầu bằng 0.
        String code = String.format(
                "%06d",
                new Random().nextInt(1_000_000)
        );

        // Cùng key nên OTP mới ghi đè OTP cũ.
        cache.put(
                key,
                new OtpEntry(
                        code,
                        now.plusSeconds(OTP_EXPIRE_SECONDS),
                        0
                )
        );

        lastSentAt.put(key, now);

        System.out.println(
                ">>> [MOCK SMS/EMAIL] Mã OTP gửi tới "
                        + target
                        + " là: "
                        + code
        );

        return code;
    }

    // Xác thực OTP.
    public Status verifyOtp(
            String target,
            String code
    ) {
        String key = target.trim().toLowerCase();

        OtpEntry entry = cache.get(key);

        // Không tồn tại hoặc đã hết hạn.
        if (
                entry == null ||
                Instant.now().isAfter(entry.expireAt())
        ) {
            cache.remove(key);
            lastSentAt.remove(key);

            return new Status(
                    VerifyResult.EXPIRED_OR_NOT_FOUND,
                    0
            );
        }

        // Đã vượt quá số lần nhập sai.
        if (entry.failedAttempts() >= MAX_ATTEMPTS) {
            cache.remove(key);

            return new Status(
                    VerifyResult.MAX_ATTEMPTS_EXCEEDED,
                    0
            );
        }

        // OTP sai.
        if (!entry.code().equals(code)) {
            int attempts =
                    entry.failedAttempts() + 1;

            int remaining =
                    MAX_ATTEMPTS - attempts;

            if (remaining <= 0) {
                cache.remove(key);
            } else {
                cache.put(
                        key,
                        new OtpEntry(
                                entry.code(),
                                entry.expireAt(),
                                attempts
                        )
                );
            }

            return new Status(
                    remaining <= 0
                            ? VerifyResult.MAX_ATTEMPTS_EXCEEDED
                            : VerifyResult.INVALID_CODE,
                    remaining
            );
        }

        // OTP đúng.
        cache.remove(key);
        lastSentAt.remove(key);

        return new Status(
                VerifyResult.SUCCESS,
                0
        );
    }

    // Hủy OTP hiện tại.
    public void invalidate(String target) {
        String key = target.trim().toLowerCase();

        cache.remove(key);
        lastSentAt.remove(key);
    }
}