import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import useAppStore from '@/store';
import type { TestRecord } from '@/types';
import { formatTime, getExceptionTypeText } from '@/utils';

interface RecordItemProps {
  record: TestRecord;
  onClick?: () => void;
}

const getAlcoholClass = (val?: number) => {
  if (val === undefined) return '';
  if (val >= 80) return 'danger';
  if (val >= 20) return 'warn';
  return '';
};

const RecordItem: React.FC<RecordItemProps> = ({ record, onClick }) => {
  const safetyNotices = useAppStore((s) => s.safetyNotices);

  const notice = useMemo(() => safetyNotices.find((n) => n.taskId === record.id), [safetyNotices, record.id]);

  const progressTag = useMemo(() => {
    if (!record.exceptionType) return null;
    if (!notice) {
      return { key: 'waiting' as const, label: '待处理' };
    }
    if (!notice.handled) {
      return { key: 'waiting' as const, label: '待处理' };
    }
    if (notice.handleResult === 'retest_pass') {
      return { key: 'retest_pass' as const, label: '已放行' };
    }
    if (notice.handleResult === 'retest_completed') {
      return { key: 'retest_completed' as const, label: '补检完成' };
    }
    if (notice.handleResult === 'replace_driver') {
      return { key: 'replace_driver' as const, label: '已替班' };
    }
    return { key: 'handled' as const, label: '已处理' };
  }, [record, notice]);

  return (
    <View className={styles.item} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.dateText}>{record.date}</Text>
          <Text className={styles.routeText}>
            {record.routeName} · {record.plateNo}
          </Text>
          {progressTag && (
            <View className={classnames(styles.progressTag, styles[progressTag.key])}>
              {progressTag.label}
            </View>
          )}
        </View>
        <StatusBadge status={record.status} />
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoCell}>
          <Text className={styles.label}>检测时间</Text>
          <Text className={styles.value}>{formatTime(record.testTime)}</Text>
        </View>
        <View className={styles.infoCell}>
          <Text className={styles.label}>照管员</Text>
          <Text className={styles.value}>{record.assistantName}</Text>
        </View>
        <View className={classnames(styles.infoCell, styles.alcoholCell)}>
          <Text className={styles.label}>酒精值</Text>
          <Text className={classnames(styles.value, getAlcoholClass(record.alcoholValue))}>
            {record.alcoholValue !== undefined ? `${record.alcoholValue}` : '--'}
            {record.alcoholValue !== undefined && <Text style={{ fontSize: '20rpx', fontWeight: 'normal' }}> mg</Text>}
          </Text>
        </View>
      </View>

      {record.exceptionType && (
        <View className={styles.hasException}>
          <Text className={styles.tag}>{getExceptionTypeText(record.exceptionType)}</Text>
          <Text className={styles.text}>{record.exceptionRemark}</Text>
        </View>
      )}
    </View>
  );
};

export default RecordItem;
