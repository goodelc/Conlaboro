package com.conlaboro.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SimpleResponse {
    private boolean success;
    private String message;
}
