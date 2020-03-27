const MOCKED_UUID = '00000000-0000-4000-a000-000000000000';
const v4 = jest.fn().mockImplementation(() => MOCKED_UUID);

export { v4, MOCKED_UUID };
