package com.example.demo.controller;

import com.example.demo.model.OrderItem;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/add")
    public ResponseEntity<Void> putOrderItem(@RequestBody OrderItem orderItem) {
        orderService.putItem(orderItem);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteOrderByCustomerIdAndOrderTime(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String orderTime,
            @RequestBody(required = false) OrderItem orderItem) {
        if (customerId != null && !customerId.isBlank() && orderTime != null && !orderTime.isBlank()) {
            orderService.deleteItemByCustomerIdAndOrderTime(customerId, orderTime);
        } else if (orderItem != null) {
            orderService.deleteItem(orderItem);
        } else if (customerId != null && !customerId.isBlank()) {
            orderService.deleteItemByCustomerId(customerId);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok().build();
    }

}
