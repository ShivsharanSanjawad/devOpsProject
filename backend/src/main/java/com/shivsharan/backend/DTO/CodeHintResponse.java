package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeHintResponse {

    private List<String> hints;
    private String summary;
    private String correctedSnippet;
}
