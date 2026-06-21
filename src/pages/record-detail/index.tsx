import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useAppStore from '@/store';
import type { TestRecord } from '@/types';
import { formatDateTime, getExceptionTypeText, getHandleResultText } from '@/utils';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';
  const records = useAppStore((s) => s.records);
  const safetyNotices = useAppStore((s) => s.safetyNotices);

  const record = useMemo<TestRecord | undefined>(() => {
    return records.find((r) => r.id === id);
  }, [id, records]);

  const relatedNotice = useMemo(() => {
    return safetyNotices.find((n) => n.taskId === id);
  }, [id, safetyNotices]);

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
                🕐
              </View>
              处理时间线
            </View>
            <View className={styles.timeline}>
              <View className={styles.tlItem}>
                <View className={classnames(styles.tlDot, styles.done)} />
                <View className={classnames(styles.tlLine, styles.done)} />
                <Text className={classnames(styles.tlTitle, styles.danger)}>异常上报</Text>
                <Text className={styles.tlDesc}>
                  {getExceptionTypeText(record.exceptionType)}：{record.exceptionRemark}
                </Text>
                {record.alcoholValue !== undefined && (
                  <Text className={classnames(styles.tlValue, record.alcoholValue >= 80 ? styles.danger : styles.warn)}>
                    首次检测 {record.alcoholValue} mg/100ml
                  </Text>
                )}
                <Text className={styles.tlTime}>{formatDateTime(relatedNotice?.createTime || record.testTime)}</Text>
                {record.exceptionPhotos && record.exceptionPhotos.length > 0 && (
                  <View className={styles.tlPhoto}>
                    <Image src={record.exceptionPhotos[0]} mode='aspectFill' />
                  </View>
                )}
              </View>

              {relatedNotice?.handled && relatedNotice?.handleResult === 'retest_pass' && relatedNotice?.retestValue !== undefined && (
                <View className={styles.tlItem}>
                  <View className={classnames(styles.tlDot, styles.done)} />
                  <View className={classnames(styles.tlLine, styles.done)} />
                  <Text className={classnames(styles.tlTitle, styles.warn)}>安全员监督复测</Text>
                  <Text className={styles.tlDesc}>
                    由 {relatedNotice.handlerName || '安全员'} 现场监督完成复测
                  </Text>
                  <Text className={classnames(styles.tlValue, relatedNotice.retestValue < 20 ? styles.success : styles.warn)}>
                    复测值 {relatedNotice.retestValue} mg/100ml
                  </Text>
                  {relatedNotice.retestTime && (
                    <Text className={styles.tlTime}>{formatDateTime(relatedNotice.retestTime)}</Text>
                  )}
                  {relatedNotice.retestPhoto && (
                    <View className={styles.tlPhoto}>
                      <Image src={relatedNotice.retestPhoto} mode='aspectFill' />
                    </View>
                  )}
                </View>
              )}

              {relatedNotice?.handled ? (
                <View className={styles.tlItem}>
                  <View className={classnames(styles.tlDot, styles.done)} />
                  <Text className={classnames(styles.tlTitle, styles.success)}>
                    处理完成 · {relatedNotice.handleResult ? getHandleResultText(relatedNotice.handleResult) : '已处理'}
                  </Text>
                  <Text className={styles.tlDesc}>
                    处理人：{relatedNotice.handlerName || '安全员'}
                    {relatedNotice.handleRemark && `｜${relatedNotice.handleRemark}`}
                  </Text>
                  {relatedNotice.handleTime && (
                    <Text className={styles.tlTime}>{formatDateTime(relatedNotice.handleTime)}</Text>
                  )}
                </View>
              ) : (
                <View className={styles.tlItem}>
                  <View className={classnames(styles.tlDot, styles.active)} />
                  <Text className={classnames(styles.tlTitle, styles.warn)}>等待安全员处理</Text>
                  <Text className={styles.tlDesc}>
                    已通知值班安全员，请耐心等待。如有紧急情况请联系车队安全主管。
                  </Text>
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
              {relatedNotice.handled && relatedNotice.handleResult && (
                <View className={styles.row}>
                  <Text className={styles.label}>处理结论</Text>
                  <Text className={styles.value}>{getHandleResultText(relatedNotice.handleResult)}</Text>
                </View>
              )}
              {relatedNotice.handled && relatedNotice.handlerName && (
                <View className={styles.row}>
                  <Text className={styles.label}>处理人</Text>
                  <Text className={styles.value}>{relatedNotice.handlerName}</Text>
                </View>
              )}
              {relatedNotice.handled && relatedNotice.handleTime && (
                <View className={styles.row}>
                  <Text className={styles.label}>处理时间</Text>
                  <Text className={styles.value}>{formatDateTime(relatedNotice.handleTime)}</Text>
                </View>
              )}
              {relatedNotice.handled && relatedNotice.handleRemark && (
                <View className={styles.remark}>{relatedNotice.handleRemark}</View>
              )}
              {!relatedNotice.handled && (
                <View className={styles.remark}>
                  值班安全员尚未处理，请耐心等待。如有紧急情况请联系车队安全主管。
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordDetailPage;
