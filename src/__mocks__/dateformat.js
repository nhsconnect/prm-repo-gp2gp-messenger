import { when } from 'jest-when';
const dateFormat = jest.fn();
when(dateFormat).calledWith(expect.anything(), 'yyyymmddHHMMss').mockReturnValue('20200403092516');
export default dateFormat;
