# Plan: Pusher Real-time Notifications

## Arsitektur
```
[Client] ← Pusher WebSocket ← [Express API] → Prisma DB
                     ↕
            Pusher SDK (server)
```
- **Private channel per-user:** `private-user-{userId}`
- **Admin channel:** `private-admin`

## 1. Setup
- `npm install pusher`
- **New file:** `src/lib/pusher.ts`
- **Edit:** `.env.example` — tambah PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER

## 2. New Utility
- **New file:** `src/utils/realtime.ts`
  - `triggerUserEvent(userId, event, data)` — push ke private-user-{userId}
  - `triggerAdminEvent(event, data)` — push ke private-admin
  - `pushNotification(userId, type, title, message, metadata?)` — create DB notif + pusher push

## 3. Event Integrations

### A. `src/utils/studentQuiz.ts` — Replace `notifyStateUpdate` placeholder
- Trigger `kc.updated` event via Pusher
- Push notification `notification.quiz`

### B. `siswa/modul/modul.controller.ts` — After enroll sukses (line 74)
- `pushNotification(siswaId, 'enrollment', 'Pendaftaran Modul', ...)`
- `triggerAdminEvent('admin.enrollment', { userId, moduleName, action: 'self-enroll' })`

### C. `umum/modul/modul.controller.ts` — After enroll sukses (line 79)  
- Sama seperti siswa

### D. `admin/modul/modul.controller.ts` — After assign success (line 55)
- `pushNotification(studentId, 'enrollment', 'Ditambahkan ke Modul', ...)`

### E. `siswa/progress/progress.service.ts` — After syncModuleProgressSummary (line 160)
- Baca latest progressPercentage → push `notification.progress`

### F. `siswa/progress/progress.service.ts` — After certificate created (line 315)
- `pushNotification(siswaId, 'certificate', 'Sertifikat Terbit', ...)`

## Files Changed
| Action | File |
|--------|------|
| New | `src/lib/pusher.ts` |
| New | `src/utils/realtime.ts` |
| Edit | `.env.example` |
| Edit | `src/utils/studentQuiz.ts` |
| Edit | `src/modules/access/siswa/modul/modul.controller.ts` |
| Edit | `src/modules/access/umum/modul/modul.controller.ts` |
| Edit | `src/modules/access/admin/modul/modul.controller.ts` |
| Edit | `src/modules/access/siswa/progress/progress.service.ts` |
