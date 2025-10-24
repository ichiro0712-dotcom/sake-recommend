import { useState, useEffect } from 'react';
import { RegisterBrand } from './components/RegisterBrand';
import { RecommendMenu } from './components/RecommendMenu';
import { UserSelect } from './components/UserSelect';
import { User } from './types';
import { StorageService } from './services/storage';

type Tab = 'recommend' | 'register';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('recommend');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleUserSelected = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    StorageService.clearCurrentUser();
    setCurrentUser(null);
  };

  const handleBrandAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  // ユーザーが選択されていない場合はユーザー選択画面を表示
  if (!currentUser) {
    return <UserSelect onUserSelected={handleUserSelected} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* ヘッダー */}
      <header style={{
        backgroundColor: '#2E5FAC',
        color: '#fff',
        padding: '16px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/logo.png"
            alt="Sake Love"
            style={{
              height: '50px',
              width: '50px',
              objectFit: 'contain'
            }}
          />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              Sake Love
            </h1>
            <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>
              ようこそ {currentUser.name} さん
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#2E5FAC',
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ユーザー変更
        </button>
      </header>

      {/* タブナビゲーション */}
      <nav style={{
        display: 'flex',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button
          onClick={() => setActiveTab('recommend')}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: activeTab === 'recommend' ? 'bold' : 'normal',
            color: activeTab === 'recommend' ? '#2E5FAC' : '#666',
            backgroundColor: '#fff',
            border: 'none',
            borderBottom: activeTab === 'recommend' ? '3px solid #2E5FAC' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📸 おすすめ
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: activeTab === 'register' ? 'bold' : 'normal',
            color: activeTab === 'register' ? '#2E5FAC' : '#666',
            backgroundColor: '#fff',
            border: 'none',
            borderBottom: activeTab === 'register' ? '3px solid #2E5FAC' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🍶 銘柄登録
        </button>
      </nav>

      {/* コンテンツ */}
      <main>
        {activeTab === 'recommend' ? (
          <RecommendMenu key={refreshKey} currentUser={currentUser} />
        ) : (
          <RegisterBrand onBrandAdded={handleBrandAdded} currentUser={currentUser} />
        )}
      </main>

      {/* フッター */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: '#999',
        fontSize: '14px'
      }}>
        <p>Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;
