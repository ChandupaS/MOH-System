package com.maternalcare.controllers;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class DataController {
    private static final List<String> GN_DIVISIONS = Arrays.asList("Ranala", "Navagamuwa", "Malabe East", "Malabe West", "Kaduwela", "Hewagama", "Athurugiriya");
    @GetMapping("/gn-divisions")
    public ResponseEntity<List<String>> getGnDivisions() { return ResponseEntity.ok(GN_DIVISIONS); }
}
