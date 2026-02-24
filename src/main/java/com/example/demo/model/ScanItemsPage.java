package com.example.demo.model;

import java.util.List;

public record ScanItemsPage(
        List<InventoryItem> items,
        String lastEvaluatedKey
) {}
