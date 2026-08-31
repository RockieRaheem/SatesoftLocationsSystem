# Security Specification - Duqact Dashboard

## 1. Data Invariants
- **User profiles**: A user can only access and modify their own profile based on their `uid`.
- **Shops**: Only admins can manage shops. A shop has an `ownerId` which links it to a user.
- **Stock**: Stock items belong to a shop via `shopId`.
- **Products**: Global catalog of products.
- **Regional Economic Levels**: Global definitions for economic communities.

## 2. The "Dirty Dozen" Payloads (Attacks)
1. **Identity Spoofing**: Attempt to create a user profile with a different UID than the authenticated user.
2. **Admin Privilege Escalation**: Attempt to update own user profile to set `role: 'admin'`.
3. **Ghost Field Injection**: Add `isVerified: true` to a product create payload.
4. **ID Poisoning**: Create a shop with a 2MB string as the document ID.
5. **Unauthorized Shop Creation**: A regular user trying to create a shop.
6. **Stock Hijacking**: User A trying to update stock for a shop owned by User B.
7. **Resource Poisoning**: Injecting a 1MB string into a product name.
8. **PII Leak**: Authenticated user trying to read another user's private profile data (if any).
9. **State Shortcutting**: Updating a shop's status directly without being an admin.
10. **Immutability Breach**: Changing `createdBy` on a product after creation.
11. **Future Timestamp**: Setting `createdAt` to a year in the future.
12. **Orphaned Write**: Creating stock for a non-existent shop ID.

## 3. Test Runner Strategy
We will use `@firebase/rules-unit-testing` to verify balance between functionality and security.
Tests will be in `firestore.rules.test.ts`.
