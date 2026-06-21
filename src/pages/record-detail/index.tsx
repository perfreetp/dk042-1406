import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockRecords } from '@/data/mockRecords';
import { mockSafetyNotices } from '@/data/mockRecords';
import type { TestRecord } from '@/types';
import { formatDateTime, getExceptionTypeText } from '@/utils';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';

  const record = useMemo<TestRecord | undefined>(() => {
    return mockRecords.find((r) => r.id === id);
  }, [id]);

  const relatedNotice = useMemo(() => {
    return mockSafetyNotices.find((n) => n.taskId === id);
  }, [id]);

  const getResultIcon = () => {
    switch (record?.status) {
      case 'pass': return '✓';
      case 'retest': return '!';
      case 'fail':
      case 'exception': return '✕';
      default: return '?';
    }
  };

  const getResultText = () => {
    switch (record?.status) {
      case 'pass': return '检测合格 · 可发车';
      case 'retest': return '临界值 · 需复测';
      case 'fail': return '检测超标 · 禁止发车';
      case 'exception': return '异常情况 · 已上报';
      default: return '待检测';
    }
  };

  const getResultClass = () => {
    switch (record?.status) {
      case 'pass': return 'pass';
      case 'retest': return 'retest';
      case 'fail': return 'fail';
      case 'exception': return 'exception';
      default: return 'pass';
    }
  };

  const getAlcoholClass = (val?: number) => {
    if (val === undefined) return '';
    if (val >= 80) return 'danger';
    if (val >= 20) return 'warn';
    return 'success';
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 120, textAlign: 'center' }}>
          <Text style={{ fontSize: 80, opacity: 0.3 }}>📋</Text>
          <View style={{ marginTop: 24, fontSize: 24, color: '#94A3B8' }}>记录不存在</View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.dateText}>{record.date}</Text>
          <Text className={styles.routeText}>
            {record.routeName} · {record.plateNo}
          </Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={classnames(styles.resultBanner, styles[getResultClass()])}>
          <View className={classnames(styles.icon, styles[getResultClass()])}>
            <Text>{getResultIcon()}</Text>
          </View>
          <Text className={classnames(styles.title, styles[getResultClass()])}>
            {getResultText()}
          </Text>
          {record.alcoholValue !== undefined && (
            <View className={styles.alcohol}>
              {record.alcoholValue}
              <Text className={styles.unit}>mg/100ml</Text>
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <View className={styles.icon}>👤</View>
            基本信息
          </View>
          <View className={styles.infoList}>
            <View className={styles.infoRow}>
              <Text className={styles.label}>驾驶员</Text>
              <Text className={styles.value}>{record.driverName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>随车照管员</Text>
              <Text className={styles.value}>{record.assistantName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>车牌号码</Text>
              <Text className={styles.value}>{record.plateNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>行驶线路</Text>
              <Text className={styles.value}>{record.routeName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>首站发车</Text>
              <Text className={styles.value}>{record.firstStopTime}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>完成检测</Text>
              <Text className={styles.value}>{formatDateTime(record.testTime)}</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <View className={styles.icon}>🔬</View>
            检测详情
          </View>
          <View className={styles.infoList}>
            <View className={styles.infoRow}>
              <Text className={styles.label}>酒精读数</Text>
              <Text className={classnames(styles.value, getAlcoholClass(record.alcoholValue))}>
                {record.alcoholValue !== undefined ? `${record.alcoholValue} mg/100ml` : '--'}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>判定标准</Text>
              <Text className={styles.value}>0-19 合格 | 20-79 复测 | ≥80 禁止</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>检测结果</Text>
              <Text className={classnames(styles.value, getResultClass())}>
                {record.alcoholValue === undefined || record.alcoholValue < 20
                  ? '合格（可发车）'
                  : record.alcoholValue < 80
                  ? '临界（需复测）'
                  : '超标（禁止发车）'}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <View className={styles.icon}>📷</View>
            留痕照片
          </View>
          <View className={styles.photoGrid}>
            <View>
              <View className={styles.photoItem}>
                <Image src={record.checkInPhoto} mode='aspectFill' />
              </View>
              <View className={styles.photoLabel}>签到照 · 身份确认</View>
            </View>
            <View>
              <View className={styles.photoItem}>
                <Image src={record.testPhoto} mode='aspectFill' />
              </View>
              <View className={styles.photoLabel}>酒测仪读数照</View>
            </View>
          </View>
        </View>

        {record.exceptionType && (
          <View className={styles.sectionCard}>
            <View className={styles.sectionTitle}>
              <View className={styles.icon} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                ⚠️
              </View>
              异常信息
            </View>
            <View className={styles.exceptionBox}>
              <View className={styles.typeTag}>{getExceptionTypeText(record.exceptionType)}</View>
              <View className={styles.remark}>{record.exceptionRemark}</View>
              {record.exceptionPhotos && record.exceptionPhotos.length > 0 && (
                <View className={styles.photos}>
                  {record.exceptionPhotos.map((p, idx) => (
                    <View key={idx} className={styles.photo}>
                      <Image src={p} mode='aspectFill' />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {relatedNotice && (
          <View className={styles.sectionCard}>
            <View className={styles.sectionTitle}>
              <View className={styles.icon}>🛡️</View>
              安全员处理
            </View>
            <View className={styles.safetyBox}>
              <View className={styles.row}>
                <Text className={styles.label}>通知时间</Text>
                <Text className={styles.value}>{formatDateTime(relatedNotice.createTime)}</Text>
              </View>
              <View className={styles.row}>
                <Text className={styles.label}>处理状态</Text>
                <Text className={styles.value}>
                  {relatedNotice.handled ? '已处理' : '待处理'}
                </Text>
              </View>
              {relatedNotice.handled && relatedNotice.handlerName && (
                <View className={styles.row}>
                  <Text className={styles.label}>处理人</Text>
                  <Text className={styles.value}>{relatedNotice.handlerName}</Text>
                </View>
              )}
              {relatedNotice.handled && relatedNotice.handleRemark && (
                <View className={styles.remark}>{relatedNotice.handleRemark}</View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordDetailPage;
