# Base de Datos — SubastUP

Schema completo en `backend/prisma/schema.prisma`.
**Nunca editar la BD a mano.** Siempre modificar el schema y correr `npx prisma migrate dev`.

## Comandos Prisma

```bash
npx prisma migrate dev --name descripcion   # crear y aplicar migración
npx prisma db push                          # push rápido sin migración (solo dev)
npx prisma studio                           # explorador visual en localhost:5555
npx prisma generate                         # regenerar el cliente después de cambios
```

## Modelos y relaciones

```
User ──────────────── Auction   (1:N, relación "SellerAuctions")
User ──────────────── Bid       (1:N, como pujador)
User ──────────────── ChatParticipant ── Chat   (M:M vía tabla pivot)
User ──────────────── Message   (1:N, mensajes enviados)
User ──────────────── Notification (1:N)
User ──────────────── UserSettings (1:1, se crea automáticamente en register)
User ──────────────── PaymentMethod (1:N)
Auction ────────────── Bid      (1:N)
Chat ───────────────── Message  (1:N)
```

## Campos clave por modelo

### User
`id, name, lastName, dni (unique), phone, email (unique), password (hashed),`
`avatarUrl, address, addressNumber, country, city, postalCode, createdAt,`
`resetCode, resetCodeExpires` ← para flujo de recuperación de contraseña

### Auction
`id, title, description, imageUrls[], category, currency (ARS|USD),`
`startingPrice, currentPrice, status, startDate, endDate, includedItems[], sellerId`

**Estados posibles:** `PENDING → ACTIVE → ENDED` o `PENDING → CANCELLED`

### Bid
`id, amount, currency, createdAt, auctionId, bidderId`

> Al crear un Bid, el `auctionController` actualiza `auction.currentPrice`
> en una **transacción Prisma** (`prisma.$transaction`). No actualizar el precio por separado.

### Chat + ChatParticipant
`Chat`: `id, createdAt`
`ChatParticipant`: PK compuesta `[userId, chatId]` (tabla pivot)

### Message
`id, text?, attachmentUrl?, attachmentType (IMAGE|FILE)?, createdAt, chatId, senderId`

### UserSettings
`id, theme (LIGHT|DARK), preferredCurrency (ARS|USD), notificationsEnabled, userId (unique)`
> Se crea automáticamente en `authController.register` con valores por defecto.

### PaymentMethod
`id, type (CREDIT_CARD|DEBIT_CARD|BANK_TRANSFER), label, isDefault, userId`
> Al marcar uno como `isDefault: true`, el controller pone en `false` los anteriores.

## Enums definidos en el schema

```prisma
AuctionStatus { PENDING, ACTIVE, ENDED, CANCELLED }
Currency      { ARS, USD }
Theme         { LIGHT, DARK }
PaymentType   { CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER }
AttachmentType{ IMAGE, FILE }
```
