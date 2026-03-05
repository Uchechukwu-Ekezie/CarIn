;; carin-rewards-token.clar
;; Implements the SIP-010 Fungible Token Standard

(define-fungible-token carin-rewards-token)

;; Constants
(define-constant err-not-authorized (err u400))
(define-constant contract-owner tx-sender)

;; Get Token Balance
(define-read-only (get-balance (account principal))
    (ok (ft-get-balance carin-rewards-token account))
)

;; Get Total Supply
(define-read-only (get-total-supply)
    (ok (ft-get-supply carin-rewards-token))
)

;; Get Token Name
(define-read-only (get-name)
    (ok "CarIn Rewards Token")
)

;; Get Token Symbol
(define-read-only (get-symbol)
    (ok "CIRT")
)

;; Get Token Decimals
(define-read-only (get-decimals)
    (ok u6)
)

;; Get Token URI (Optional)
(define-read-only (get-token-uri)
    (ok none)
)

;; Transfer Token
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-authorized)
        (match memo to-print (print to-print) 0x)
        (ft-transfer? carin-rewards-token amount sender recipient)
    )
)

;; Mint Tokens - Only Authorized Contracts (e.g., Rewards Manager) can mint
;; For MVP, authorized callers mapping is simplified to just the contract-owner
(define-public (mint (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        (ft-mint? carin-rewards-token amount recipient)
    )
)
