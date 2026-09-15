import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createReminderRepository, type ReminderDb } from './reminder.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as ReminderDb;
  return createReminderRepository(db);
}

test('생성 시 notificationId는 항상 null이다 (실제 알림 예약은 이번 범위 밖)', async () => {
  const repo = setup();
  const reminder = await repo.create({
    petId: 'pet-1',
    sourceType: 'medication',
    sourceId: 'med-1',
    scheduledAt: '2026-09-16T21:00:00.000Z',
  });
  expect(reminder.notificationId).toBeNull();
});

test('sourceId로 조회할 수 있다', async () => {
  const repo = setup();
  await repo.create({
    petId: 'pet-1',
    sourceType: 'medication',
    sourceId: 'med-1',
    scheduledAt: '2026-09-16T21:00:00.000Z',
  });

  const found = await repo.getBySource('med-1');
  expect(found?.sourceType).toBe('medication');

  expect(await repo.getBySource('없는-source')).toBeNull();
});

test('petId로 목록 조회하면 예정 시각순으로 나온다', async () => {
  const repo = setup();
  await repo.create({
    petId: 'pet-1',
    sourceType: 'medication',
    sourceId: 'med-2',
    scheduledAt: '2026-09-20T09:00:00.000Z',
  });
  await repo.create({
    petId: 'pet-1',
    sourceType: 'medication',
    sourceId: 'med-1',
    scheduledAt: '2026-09-16T21:00:00.000Z',
  });

  const list = await repo.listByPet('pet-1');
  expect(list.map((r) => r.sourceId)).toEqual(['med-1', 'med-2']);
});

test('notificationId를 갱신할 수 있고(재예약), 삭제(취소)도 된다', async () => {
  const repo = setup();
  const reminder = await repo.create({
    petId: 'pet-1',
    sourceType: 'medication',
    sourceId: 'med-1',
    scheduledAt: '2026-09-16T21:00:00.000Z',
  });

  const scheduled = await repo.updateNotificationId(reminder.id, 'os-notif-1');
  expect(scheduled?.notificationId).toBe('os-notif-1');

  // 시간 변경 시: 기존 알림 취소(id를 null로) → 새로 예약(새 id로 갱신)
  const rescheduled = await repo.updateNotificationId(reminder.id, 'os-notif-2');
  expect(rescheduled?.notificationId).toBe('os-notif-2');

  await repo.remove(reminder.id);
  expect(await repo.getBySource('med-1')).toBeNull();
});
