import type { SQLiteDatabase } from 'expo-sqlite';

/** 알림이 걸린 원본 레코드의 종류. Phase 3 범위는 복약뿐이지만 접종/검진 알림도 같은 구조를 쓸 수 있게 열어둔다. */
export type ReminderSourceType = 'medication' | 'vaccination' | 'checkup';

export type Reminder = {
  id: string;
  petId: string;
  sourceType: ReminderSourceType;
  sourceId: string;
  scheduledAt: string;
  /** OS에 예약된 알림 ID. 실제 `expo-notifications` 연동(S3)은 이번 범위 밖이라 항상 null이다 — ADR `260915-154023`. */
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderInput = {
  petId: string;
  sourceType: ReminderSourceType;
  sourceId: string;
  scheduledAt: string;
};

export type ReminderDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type ReminderRow = {
  id: string;
  pet_id: string;
  source_type: ReminderSourceType;
  source_id: string;
  scheduled_at: string;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
};

function toReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    petId: row.pet_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    scheduledAt: row.scheduled_at,
    notificationId: row.notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createReminderRepository(db: ReminderDb) {
  async function create(input: CreateReminderInput): Promise<Reminder> {
    const now = new Date().toISOString();
    const record: Reminder = {
      id: generateId(),
      ...input,
      notificationId: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO reminders (id, pet_id, source_type, source_id, scheduled_at, notification_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        record.id,
        record.petId,
        record.sourceType,
        record.sourceId,
        record.scheduledAt,
        record.notificationId,
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  /**
   * 원본 레코드(sourceId)에 연결된 reminder를 찾는다. `sourceId`는 우리 ID 생성 방식(`generateId`)상
   * 테이블을 넘나들어도 충돌하지 않는 고유값이라 `sourceType`까지 조건에 넣지 않아도 안전하다.
   */
  async function getBySource(sourceId: string): Promise<Reminder | null> {
    const row = await db.getFirstAsync<ReminderRow>('SELECT * FROM reminders WHERE source_id = ?', [
      sourceId,
    ]);
    return row ? toReminder(row) : null;
  }

  async function listByPet(petId: string): Promise<Reminder[]> {
    const rows = await db.getAllAsync<ReminderRow>(
      'SELECT * FROM reminders WHERE pet_id = ? ORDER BY scheduled_at ASC',
      [petId],
    );
    return rows.map(toReminder);
  }

  async function updateNotificationId(
    id: string,
    notificationId: string | null,
  ): Promise<Reminder | null> {
    const existing = await db.getFirstAsync<ReminderRow>('SELECT * FROM reminders WHERE id = ?', [
      id,
    ]);
    if (!existing) return null;
    const updated = toReminder(existing);
    updated.notificationId = notificationId;
    updated.updatedAt = new Date().toISOString();
    await db.runAsync('UPDATE reminders SET notification_id = ?, updated_at = ? WHERE id = ?', [
      updated.notificationId,
      updated.updatedAt,
      id,
    ]);
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
  }

  return { create, getBySource, listByPet, updateNotificationId, remove };
}
