import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import TaskCard from '@/components/TaskCard';
import useAppStore from '@/store';
import { mockUser } from '@/data/mockUser';
import { mockBusList, mockRouteList, mockTodayTask } from '@/data/mockTasks';
import { getCloseLoopStepText } from '@/utils';
import type { MorningTask } from '@/types';

const HomePage: React.FC = () => {
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [task, setTask] = useState<MorningTask>(mockTodayTask);
  const records = useAppStore((s) => s.records);
  const safetyNotices = useAppStore((s) => s.safetyNotices);
  const getTodayTaskStatus = useAppStore((s) => s.getTodayTaskStatus);
  const getTodayCloseLoopInfo = useAppStore((s) => s.getTodayCloseLoopInfo);

  const todayStatus = useMemo(() => getTodayTaskStatus(mockUser.name), [getTodayTaskStatus, records, safetyNotices]);
  const closeLoopInfo = useMemo(() => getTodayCloseLoopInfo(mockUser.name), [getTodayCloseLoopInfo, records, safetyNotices]);

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

    if (closeLoopInfo.hasException && closeLoopInfo.relatedRecordId) {
      console.log('[Home] 查看今日异常闭环详情', closeLoopInfo);
      Taro.navigateTo({ url: `/pages/record-detail/index?id=${closeLoopInfo.relatedRecordId}` });
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

  const handleGoSupervisor = () => {
    Taro.navigateTo({ url: '/pages/supervisor-summary/index' });
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

        {closeLoopInfo.hasException && closeLoopInfo.currentStep && (
          <View className={styles.loopStatus}>
            <View className={styles.loopHeader}>
              <Text className={styles.loopTitle}>
                <Text className={styles.loopIcon}>🔄</Text>
                今日异常闭环
              </Text>
              <Text className={styles.loopHint}>
                {getCloseLoopStepText(closeLoopInfo.currentStep)}
              </Text>
            </View>

            <View className={styles.stepper}>
              {[
                { key: 'safety', label: '安全员处理' },
                { key: 'supervisor', label: '主管确认' },
                { key: 'archived', label: '已归档' }
              ].map((step, idx) => {
                const stepOrder = ['safety', 'supervisor', 'archived'];
                const currentIdx = stepOrder.indexOf(closeLoopInfo.currentStep);
                const stepIdx = stepOrder.indexOf(step.key);
                let status: 'pending' | 'active' | 'done' | 'returned' = 'pending';
                if (todayStatus === 'returned' && step.key === 'supervisor') {
                  status = 'returned';
                } else if (stepIdx < currentIdx) {
                  status = 'done';
                } else if (step.key === closeLoopInfo.currentStep) {
                  status = 'active';
                }
                const isLineDone = stepIdx < currentIdx;
                const showDotNum = status === 'pending' || status === 'active';
                const dotContent = status === 'done' ? '✓' : status === 'returned' ? '!' : showDotNum ? String(stepIdx + 1) : '';
                return (
                  <View key={step.key} className={styles.step}>
                    <View
                      className={classnames(
                        styles.stepDot,
                        styles[status]
                      )}
                    >
                      {dotContent}
                    </View>
                    <View className={classnames(styles.stepLine, isLineDone && styles.done)} />
                    <Text
                      className={classnames(
                        styles.stepLabel,
                        status === 'active' && styles.active,
                        status === 'done' && styles.done,
                        status === 'returned' && styles.returned
                      )}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View
              className={classnames(
                styles.loopCTA,
                closeLoopInfo.currentStep === 'safety' && styles.warn,
                closeLoopInfo.currentStep === 'supervisor' && styles.warn,
                closeLoopInfo.currentStep === 'archived' && styles.success,
                todayStatus === 'returned' && styles.danger
              )}
              onClick={() => {
                if (closeLoopInfo.relatedRecordId) {
                  Taro.navigateTo({ url: `/pages/record-detail/index?id=${closeLoopInfo.relatedRecordId}` });
                }
              }}
            >
              {todayStatus === 'returned'
                ? '🔴 被退回，请补充说明 →'
                : closeLoopInfo.currentStep === 'safety'
                ? '🟠 安全员正在处理中，点击查看详情 →'
                : closeLoopInfo.currentStep === 'supervisor'
                ? '🟠 等待主管确认，点击查看详情 →'
                : '✅ 已归档，点击查看详情 →'}
            </View>
          </View>
        )}

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
          <View className={styles.actionCard} onClick={handleGoSupervisor}>
            <View className={`${styles.actionIcon} ${styles.blue}`}>👔</View>
            <Text className={styles.actionText}>主管汇总</Text>
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
