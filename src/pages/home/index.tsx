import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import TaskCard from '@/components/TaskCard';
import useAppStore from '@/store';
import { mockUser } from '@/data/mockUser';
import { mockBusList, mockRouteList, mockTodayTask } from '@/data/mockTasks';
import type { MorningTask } from '@/types';

const HomePage: React.FC = () => {
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [task, setTask] = useState<MorningTask>(mockTodayTask);
  const records = useAppStore((s) => s.records);
  const safetyNotices = useAppStore((s) => s.safetyNotices);
  const getTodayTaskStatus = useAppStore((s) => s.getTodayTaskStatus);

  const todayStatus = useMemo(() => getTodayTaskStatus(mockUser.name), [getTodayTaskStatus, records, safetyNotices]);

  const stats = useMemo(() => {
    const total = records.length;
    const passCount = records.filter((r) => r.status === 'pass').length;
    const exceptionCount = records.filter(
      (r) => r.status === 'retest' || r.status === 'fail' || r.status === 'exception'
    ).length;
    return { total, passCount, exceptionCount };
  }, [records]);

  const handleStartTest = () => {
    const bus = mockBusList.find((b) => b.id === selectedBusId);
    const route = mockRouteList.find((r) => r.id === selectedRouteId);

    if (todayStatus === 'waiting') {
      console.log('[Home] 查看处理进度');
      Taro.navigateTo({ url: '/pages/safety-notice/index' });
      return;
    }
    if (todayStatus === 'handled') {
      console.log('[Home] 查看今日记录');
      Taro.switchTab({ url: '/pages/records/index' });
      return;
    }

    if (!bus || !route) {
      Taro.showToast({ title: '请先选择车牌和线路', icon: 'none' });
      return;
    }

    setTask((prev) => ({
      ...prev,
      busId: bus.id,
      plateNo: bus.plateNo,
      routeId: route.id,
      routeName: route.name,
      firstStopTime: route.firstStopTime,
      assistantName: route.assistantName,
      assistantPhone: route.assistantPhone
    }));

    console.log('[Home] 开始酒测任务', { bus: bus.plateNo, route: route.name, todayStatus });

    Taro.navigateTo({
      url: `/pages/alcohol-test/index?busId=${bus.id}&routeId=${route.id}`
    });
  };

  const handleGoRecords = () => {
    Taro.switchTab({ url: '/pages/records/index' });
  };

  const handleGoSafety = () => {
    Taro.navigateTo({ url: '/pages/safety-notice/index' });
  };

  const handleDeviceError = () => {
    const bus = mockBusList.find((b) => b.id === selectedBusId);
    const route = mockRouteList.find((r) => r.id === selectedRouteId);
    console.log('[Home] 设备故障上报');
    Taro.navigateTo({
      url: `/pages/exception-report/index?type=device_error&plateNo=${encodeURIComponent(bus?.plateNo || '')}&routeName=${encodeURIComponent(route?.name || '')}`
    });
  };

  const handleTimeout = () => {
    const bus = mockBusList.find((b) => b.id === selectedBusId);
    const route = mockRouteList.find((r) => r.id === selectedRouteId);
    console.log('[Home] 超时未检上报');
    Taro.navigateTo({
      url: `/pages/exception-report/index?type=timeout&plateNo=${encodeURIComponent(bus?.plateNo || '')}&routeName=${encodeURIComponent(route?.name || '')}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userBar}>
          <Image className={styles.avatar} src={mockUser.avatar} mode='aspectFill' />
          <View className={styles.userInfo}>
            <Text className={styles.userGreeting}>早上好，今日行车请注意安全</Text>
            <Text className={styles.userName}>{mockUser.name}</Text>
            <View className={styles.schoolTag}>工号 {mockUser.employeeNo}</View>
          </View>
        </View>

        <View className={styles.statRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>累计检测</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.passCount}</Text>
            <Text className={styles.statLabel}>合格次数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.exceptionCount}</Text>
            <Text className={styles.statLabel}>异常记录</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <TaskCard
          task={task}
          busList={mockBusList}
          routeList={mockRouteList}
          selectedBusId={selectedBusId}
          selectedRouteId={selectedRouteId}
          onBusChange={setSelectedBusId}
          onRouteChange={setSelectedRouteId}
          onStartTest={handleStartTest}
          todayStatus={todayStatus}
        />

        <View className={styles.sectionTitle}>
          <Text className={styles.title}>快捷操作</Text>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionCard} onClick={handleGoRecords}>
            <View className={`${styles.actionIcon} ${styles.blue}`}>📋</View>
            <Text className={styles.actionText}>历史记录</Text>
          </View>
          <View className={styles.actionCard} onClick={handleGoSafety}>
            <View className={`${styles.actionIcon} ${styles.orange}`}>⚠️</View>
            <Text className={styles.actionText}>异常处理</Text>
          </View>
          <View className={styles.actionCard} onClick={handleDeviceError}>
            <View className={`${styles.actionIcon} ${styles.red}`}>🔧</View>
            <Text className={styles.actionText}>设备故障</Text>
          </View>
          <View className={styles.actionCard} onClick={handleTimeout}>
            <View className={`${styles.actionIcon} ${styles.orange}`}>⏰</View>
            <Text className={styles.actionText}>超时未检</Text>
          </View>
        </View>

        <View className={styles.sectionTitle}>
          <Text className={styles.title}>操作指引</Text>
        </View>

        <View className={styles.tipsCard}>
          <View className={styles.tipsHeader}>
            <View className={styles.tipsIcon}>💡</View>
            <Text className={styles.tipsTitle}>晨检酒测流程说明</Text>
          </View>
          <View className={styles.tipsList}>
            <Text className={styles.tipItem}>选择今日的车牌和线路后开始检测</Text>
            <Text className={styles.tipItem}>第一步：拍照签到，确认是本人操作</Text>
            <Text className={styles.tipItem}>第二步：使用酒测仪吹气，录入读数或扫码同步</Text>
            <Text className={styles.tipItem}>第三步：确认检测结果，合格后可安全发车</Text>
            <Text className={styles.tipItem}>如酒测仪故障或超时未检，可从快捷操作直接上报</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
