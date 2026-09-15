import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConfirmDialog } from './confirm-dialog';

test('visible이 false면 내용이 안 보인다', async () => {
  await render(
    <ConfirmDialog
      visible={false}
      title="이 기록을 삭제할까요?"
      onConfirm={() => {}}
      onCancel={() => {}}
    />,
  );
  expect(screen.queryByText('이 기록을 삭제할까요?')).toBeNull();
});

test('확인/취소를 누르면 각각의 콜백이 호출된다', async () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  await render(
    <ConfirmDialog
      visible
      title="이 기록을 삭제할까요?"
      description="삭제한 기록은 복구할 수 없어요."
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );

  expect(screen.getByText('이 기록을 삭제할까요?')).toBeTruthy();
  expect(screen.getByText('삭제한 기록은 복구할 수 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('삭제'));
  expect(onConfirm).toHaveBeenCalledTimes(1);

  await fireEvent.press(screen.getByLabelText('취소'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});
