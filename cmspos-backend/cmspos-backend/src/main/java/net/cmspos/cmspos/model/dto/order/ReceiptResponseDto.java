package net.cmspos.cmspos.model.dto.order;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReceiptResponseDto {
    private final String receiptNumber;
    private final LocalDateTime generatedAt;
    private final String content;
}
