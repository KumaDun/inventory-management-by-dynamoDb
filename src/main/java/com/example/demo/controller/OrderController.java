package com.example.demo.controller;

import com.example.demo.model.OrderItem;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/orders")
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
    public ResponseEntity<Void> deleteOrderItem(@RequestBody OrderItem orderItem) {
        orderService.deleteItem(orderItem);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteOrderByCustomerIdAndOrderTime(
            @PathVariable String customerId, @PathVariable String orderTime) {
        orderService.deleteItemByCustomerIdAndOrderTime(customerId, orderTime);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteOrderByCustomerId(@PathVariable String customerId) {
        orderService.deleteItemByCustomerId(customerId);
        return ResponseEntity.ok().build();
    }

}
