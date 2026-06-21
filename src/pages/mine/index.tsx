import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockUser } from '@/data/mockUser';
import { mockRecords } from '@/data/mockRecords';
import { mockSafetyNotices } from '@/data/mockRecords';

const MinePage: React.FC = () => {
  const monthStats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const monthRecords = mockRecords.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const totalDays = mockRecords.length;
    const passDays = monthRecords.filter((r) => r.status === 'pass').length;
    const abnormalDays = monthRecords.filter(
      (r) => r.status !== 'pass' && r.status !== 'pending' && r.status !== 'testing'
    ).length;
    const passRate = totalDays > 0 ? Math.round((passDays / totalDays) * 100) : 0;
    return { totalDays, passDays, abnormalDays, passRate };
  }, []);

  const unhandledCount = mockSafetyNotices.filter((n) => !n.handled).length;

  const handleMenuClick = (type: string) => {
    console.log('[Mine] 点击菜单项', type);
    switch (type) {
      case 'safety':
        Taro.navigateTo({ url: '/pages/safety-notice/index' });
        break;
      case 'records':
        Taro.switchTab({ url: '/pages/records/index' });
        break;
      case 'about':
        Taro.showToast({ title: '版本 v1.0.0', icon: 'none' });
        break;
      case 'logout':
        Taro.showModal({
          title: '提示',
          content: '确定退出登录吗？',
          success: (res) => {
            if (res.confirm) {
              Taro.showToast({ title: '已退出', icon: 'success' });
            }
          }
        });
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Image className={styles.avatar} src={mockUser.avatar} mode='aspectFill' />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{mockUser.name}</Text>
            <View className={styles.userRole}>校车驾驶员</View>
            <Text className={styles.schoolName}>{mockUser.schoolName}</Text>
          </View>
        </View>

        <View className={styles.statGrid}>
          <View className={styles.statItem}>
            <Text className={styles.num}>{monthStats.totalDays}</Text>
            <Text className={styles.label}>累计出勤</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{monthStats.passDays}</Text>
            <Text className={styles.label}>本月合格</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{monthStats.abnormalDays}</Text>
            <Text className={styles.label}>异常次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{monthStats.passRate}%</Text>
            <Text className={styles.label}>合格率</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>安全管理</View>
          <View className={styles.menuList}>
            <View className={styles.menuItem} onClick={() => handleMenuClick('safety')}>
              <View className={`${styles.menuIcon} ${styles.orange}`}>🔔</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>安全员通知</Text>
                <Text className={styles.menuSubtitle}>待处理的异常通知</Text>
              </View>
              {unhandledCount > 0 && <View className={styles.menuBadge}>{unhandledCount}</View>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('records')}>
              <View className={`${styles.menuIcon} ${styles.blue}`}>📋</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>晨检记录</Text>
                <Text className={styles.menuSubtitle}>查看历史检测记录</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('report')}>
              <View className={`${styles.menuIcon} ${styles.red}`}>📝</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>异常上报</Text>
                <Text className={styles.menuSubtitle}>手动上报异常情况</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>个人信息</View>
          <View className={styles.infoList}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>员工编号</Text>
              <Text className={styles.infoValue}>{mockUser.employeeNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{mockUser.phone}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>驾驶证号</Text>
              <Text className={styles.infoValue}>{mockUser.driverLicense}</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>其他</View>
          <View className={styles.menuList}>
            <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
              <View className={`${styles.menuIcon} ${styles.gray}`}>ℹ️</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>关于</Text>
                <Text className={styles.menuSubtitle}>版本信息、用户协议</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('logout')}>
              <View className={`${styles.menuIcon} ${styles.gray}`}>🚪</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>退出登录</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
