package com.maternalcare.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "http://localhost:5173")
public class DataController {
    private static final List<String> GN_DIVISIONS = Arrays.asList("Ranala", "Navagamuwa", "Malabe East", "Malabe West", "Kaduwela", "Hewagama", "Athurugiriya");
    @GetMapping("/gn-divisions")
    public ResponseEntity<List<String>> getGnDivisions() { return ResponseEntity.ok(GN_DIVISIONS); }
}
