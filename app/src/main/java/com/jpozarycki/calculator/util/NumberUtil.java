package com.jpozarycki.calculator.util;

import lombok.experimental.UtilityClass;

import java.util.regex.Pattern;

@UtilityClass
public class NumberUtil {
    private static final Pattern NUMBER_PATTERN = Pattern.compile("-?\\d+");

    public static boolean isNumber(String token) {
        return NUMBER_PATTERN.matcher(token).matches();
    }
}
