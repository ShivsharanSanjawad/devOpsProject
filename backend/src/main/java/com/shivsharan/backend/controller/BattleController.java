package com.shivsharan.backend.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.shivsharan.backend.DTO.BattleDTO;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.UserRepository;
import com.shivsharan.backend.service.BattleService;

@RestController
@RequestMapping("/api/battle")
public class BattleController {

    @Autowired
    private BattleService battleService;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/battle/create  — create a room, get a party code
     */
    @PostMapping("/create")
    public ResponseEntity<BattleDTO> createRoom(@AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        BattleDTO dto = battleService.createRoom(user);
        return ResponseEntity.ok(dto);
    }

    /**
     * POST /api/battle/join  — join a room by party code
     * Body: { "partyCode": "ABC123" }
     */
    @PostMapping("/join")
    public ResponseEntity<BattleDTO> joinRoom(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        String code = body.get("partyCode");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        User user = resolveUser(principal);
        BattleDTO dto = battleService.joinRoom(code, user);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/battle/{id}  — get current battle state
     */
    @GetMapping("/{id}")
    public ResponseEntity<BattleDTO> getBattle(@PathVariable UUID id) {
        BattleDTO dto = battleService.getBattle(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/battle/code/{partyCode}  — get battle by party code
     */
    @GetMapping("/code/{partyCode}")
    public ResponseEntity<BattleDTO> getBattleByCode(@PathVariable String partyCode) {
        BattleDTO dto = battleService.getBattleByCode(partyCode);
        return ResponseEntity.ok(dto);
    }

    /**
     * DELETE /api/battle/{partyCode}  — cancel a waiting room
     */
    @DeleteMapping("/{partyCode}")
    public ResponseEntity<Void> cancelRoom(
            @PathVariable String partyCode,
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        battleService.cancelRoom(partyCode, user);
        return ResponseEntity.noContent().build();
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
