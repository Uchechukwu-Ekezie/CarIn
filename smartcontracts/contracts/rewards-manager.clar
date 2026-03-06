;; rewards-manager.clar
;; Manages the distribution of CarIn Rewards Tokens

;; Constants
(define-constant err-not-authorized (err u500))
(define-constant err-no-pending-rewards (err u501))
(define-constant contract-owner tx-sender)


;; Data Maps
(define-map pending-rewards
    principal
    uint
)

;; Add Pending Reward (Only authorized oracle/admin)
(define-public (add-reward (user principal) (amount uint))
    (let
        (
            (current-rewards (default-to u0 (map-get? pending-rewards user)))
        )
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        
        (map-set pending-rewards user (+ current-rewards amount))
        (ok true)
    )
)

;; Claim Rewards
(define-public (claim-rewards)
    (let
        (
            (amount (default-to u0 (map-get? pending-rewards tx-sender)))
        )
        (asserts! (> amount u0) err-no-pending-rewards)
        
        ;; Mint tokens to the user
        (try! (contract-call? .carin-rewards-token mint amount tx-sender))
        
        ;; Reset pending rewards
        (map-set pending-rewards tx-sender u0)
        (ok amount)
    )
)

;; Read-only functions
(define-read-only (get-pending-rewards (user principal))
    (default-to u0 (map-get? pending-rewards user))
)
