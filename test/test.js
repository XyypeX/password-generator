// test/test.js

// Мокаем electron и ipcMain.handle
jest.mock('electron', () => {
  return {
    ipcMain: {
      handle: jest.fn(),
    },
  };
});

const { ipcMain } = require('electron');

describe('ipcMain handlers', () => {
  let handlers = {};
  let mockDb;

  beforeAll(() => {
    // Перехватываем вызовы ipcMain.handle и сохраняем обработчики
    ipcMain.handle.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    mockDb = {
      savePassword: jest.fn(),
      getHistory: jest.fn(),
    };

    // Регистрируем обработчики с моковой базой
    ipcMain.handle('save-password', async (event, password) => {
      try {
        const id = await mockDb.savePassword(password);
        return { success: true, id };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle('get-history', async () => {
      try {
        const rows = await mockDb.getHistory(10);
        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
  });

  test('save-password returns success', async () => {
    mockDb.savePassword.mockResolvedValue(42);
    const result = await handlers['save-password'](null, 'mypassword');
    expect(mockDb.savePassword).toHaveBeenCalledWith('mypassword');
    expect(result).toEqual({ success: true, id: 42 });
  });

  test('save-password returns error', async () => {
    mockDb.savePassword.mockRejectedValue(new Error('fail'));
    const result = await handlers['save-password'](null, 'mypassword');
    expect(result).toEqual({ success: false, error: 'fail' });
  });

  test('get-history returns success', async () => {
    const fakeData = [{ password: '123' }];
    mockDb.getHistory.mockResolvedValue(fakeData);
    const result = await handlers['get-history']();
    expect(mockDb.getHistory).toHaveBeenCalledWith(10);
    expect(result).toEqual({ success: true, data: fakeData });
  });

  test('get-history returns error', async () => {
    mockDb.getHistory.mockRejectedValue(new Error('fail'));
    const result = await handlers['get-history']();
    expect(result).toEqual({ success: false, error: 'fail' });
  });
});
