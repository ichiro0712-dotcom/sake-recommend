import { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  onUserSelected: (user: User) => void;
}

export function UserSelect({ onUserSelected }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsers(StorageService.getUsers());
  }, []);

  const handleRegisterUser = () => {
    if (!newUserName.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    try {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName.trim(),
        createdAt: Date.now()
      };

      StorageService.addUser(newUser);
      setUsers(StorageService.getUsers());
      setNewUserName('');
      setShowRegisterModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザー登録に失敗しました');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img
            src="/logo.png"
            alt="Sake Love"
            style={{
              height: '100px',
              width: '100px',
              margin: '0 auto 20px'
            }}
          />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2E5FAC', marginBottom: '10px' }}>
            Sake Love
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            ユーザーを選択してください
          </p>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserSelected(user)}
              style={{
                padding: '16px 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2E5FAC',
                backgroundColor: '#fff',
                border: '2px solid #2E5FAC',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2E5FAC';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#2E5FAC';
              }}
            >
              👤 {user.name}
            </button>
          ))}
        </div>

        {users.length < 10 && (
          <button
            onClick={() => setShowRegisterModal(true)}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: '#2E5FAC',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            ➕ 新しいユーザーを登録
          </button>
        )}

        {users.length >= 10 && (
          <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
            ユーザー数が上限に達しています（最大10人）
          </p>
        )}

        {/* 登録モーダル */}
        {showRegisterModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                新しいユーザーを登録
              </h3>

              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="ユーザー名を入力"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleRegisterUser()}
              />

              {error && (
                <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '15px' }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowRegisterModal(false);
                    setNewUserName('');
                    setError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#666',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleRegisterUser}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: '#2E5FAC',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
