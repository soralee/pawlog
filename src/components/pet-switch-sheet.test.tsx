import { fireEvent, render, screen } from '@testing-library/react-native';

import { PetSwitchSheet } from './pet-switch-sheet';

const SAMPLE_PETS = [
  { id: 'pet-1', name: '보리', photoUri: null },
  { id: 'pet-2', name: '뭉치', photoUri: null },
];

test('제목 "반려동물 선택", 선택된 펫 체크 표시, "+ 반려동물 추가" 행을 렌더한다', async () => {
  const onSelectPet = jest.fn();
  const onAddPet = jest.fn();
  const onClose = jest.fn();

  await render(
    <PetSwitchSheet
      visible
      pets={SAMPLE_PETS}
      selectedPetId="pet-1"
      onSelectPet={onSelectPet}
      onAddPet={onAddPet}
      onClose={onClose}
    />,
  );

  expect(screen.getByText('반려동물 선택')).toBeTruthy();
  expect(screen.getByTestId('pet-selected-pet-1')).toBeTruthy();
  expect(screen.queryByTestId('pet-selected-pet-2')).toBeNull();
  expect(screen.getByText('+ 반려동물 추가')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('뭉치'));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSelectPet).toHaveBeenCalledWith('pet-2');

  await fireEvent.press(screen.getByText('+ 반려동물 추가'));
  expect(onAddPet).toHaveBeenCalledTimes(1);
});
