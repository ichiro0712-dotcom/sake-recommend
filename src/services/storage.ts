import { SakeBrand, User } from '../types';

const SAKE_BRANDS_KEY = 'sake_brands';
const USERS_KEY = 'sake_users';
const CURRENT_USER_KEY = 'sake_current_user';

export const StorageService = {
  // ユーザー管理
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  },

  addUser(user: User): void {
    const users = this.getUsers();
    if (users.length >= 10) {
      throw new Error('ユーザー数が上限に達しています（最大10人）');
    }
    users.push(user);
    this.saveUsers(users);
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  clearCurrentUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // 銘柄管理（ユーザーごと）
  getBrands(userId?: string): SakeBrand[] {
    try {
      const data = localStorage.getItem(SAKE_BRANDS_KEY);
      const allBrands: SakeBrand[] = data ? JSON.parse(data) : [];
      if (userId) {
        return allBrands.filter(b => b.userId === userId);
      }
      return allBrands;
    } catch (error) {
      console.error('Error loading brands:', error);
      return [];
    }
  },

  saveBrands(brands: SakeBrand[]): void {
    try {
      localStorage.setItem(SAKE_BRANDS_KEY, JSON.stringify(brands));
    } catch (error) {
      console.error('Error saving brands:', error);
      throw error;
    }
  },

  addBrand(brand: SakeBrand): void {
    const brands = this.getBrands();
    brands.push(brand);
    this.saveBrands(brands);
  },

  deleteBrand(id: string): void {
    const brands = this.getBrands();
    const filtered = brands.filter(b => b.id !== id);
    this.saveBrands(filtered);
  },

  clearAll(): void {
    localStorage.removeItem(SAKE_BRANDS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
