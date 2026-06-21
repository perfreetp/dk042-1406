import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import RecordItem from '@/components/RecordItem';
import useAppStore from '@/store';
import type { TestStatus, TestRecord } from '@/types';

type ResultFilter = TestStatus | 'all';
type ProgressFilter = 'all' | 'waiting' | 'handled' | 'retest_pass' | 'replace_driver' | 'retest_completed';

const RESULT_FILTERS: { key: ResultFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pass', label: '可发车' },
  { key: 'retest', label: '需复测' },
  { key: 'fail', label: '禁止发车' },
  { key: 'exception', label: '异常' }
];

const PROGRESS_FILTERS: { key: ProgressFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'waiting', label: '待处理' },
  { key: 'handled', label: '已处理' },
  { key: 'retest_pass', label: '已放行' },
  { key: 'retest_completed', label: '补检完成' },
  { key: 'replace_driver', label: '已替班' }
];

const RecordsPage: React.FC = () => {
  const [activeResult, setActiveResult] = useState<ResultFilter>('all');
  const [activeProgress, setActiveProgress] = useState<ProgressFilter>('all');
  const records = useAppStore((s) => s.records);
  const safetyNotices = useAppStore((s) => s.safetyNotices);

  const summary = useMemo(() => {
    const pass = records.filter((r) => r.status === 'pass').length;
    const retest = records.filter((r) => r.status === 'retest').length;
    const exception = records.filter(
      (r) => r.status === 'fail' || r.status === 'exception'
    ).length;
    return { pass, retest, exception };
  }, [records]);

  const matchProgress = (record: TestRecord, key: ProgressFilter): boolean => {
    if (key === 'all') return true;
    const notice = safetyNotices.find((n) => n.taskId === record.id);
    if (!notice) return key === 'waiting' && (record.status !== 'pass');
    if (key === 'waiting') return !notice.handled;
    if (key === 'handled') return notice.handled;
    if (key === 'retest_pass') return notice.handled && notice.handleResult === 'retest_pass';
    if (key === 'retest_completed') return notice.handled && notice.handleResult === 'retest_completed';
    if (key === 'replace_driver') return notice.handled && notice.handleResult === 'replace_driver';
    return true;
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (activeResult !== 'all' && r.status !== activeResult) return false;
      if (!matchProgress(r, activeProgress)) return false;
      return true;
    });
  }, [activeResult, activeProgress, records, safetyNotices]);

  const handleRecordClick = (id: string) => {
    console.log('[Records] 查看记录详情', id);
    Taro.navigateTo({
      url: `/pages/record-detail/index?id=${id}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.summaryBar}>
          <View className={styles.summaryItem}>
            <Text className={`${styles.num} ${styles.green}`}>{summary.pass}</Text>
            <Text className={styles.label}>合格</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={`${styles.num} ${styles.orange}`}>{summary.retest}</Text>
            <Text className={styles.label}>复测</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={`${styles.num} ${styles.red}`}>{summary.exception}</Text>
            <Text className={styles.label}>异常</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, color: '#94A3B8', padding: '0 8rpx', marginBottom: 8, display: 'block' }}>
            检测结果
          </Text>
          <ScrollView scrollX className={styles.filterTabs}>
            {RESULT_FILTERS.map((f) => (
              <View
                key={f.key}
                className={classnames(styles.filterTab, activeResult === f.key && styles.active)}
                onClick={() => setActiveResult(f.key)}
              >
                <Text>{f.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={{ fontSize: 20, color: '#94A3B8', padding: '0 8rpx', marginBottom: 8, display: 'block' }}>
            处理进度
          </Text>
          <ScrollView scrollX className={styles.filterTabs}>
            {PROGRESS_FILTERS.map((f) => (
              <View
                key={f.key}
                className={classnames(styles.filterTab, activeProgress === f.key && styles.active)}
                onClick={() => setActiveProgress(f.key)}
              >
                <Text>{f.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <View className={styles.content}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <RecordItem
              key={record.id}
              record={record}
              onClick={() => handleRecordClick(record.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无相关记录</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordsPage;
