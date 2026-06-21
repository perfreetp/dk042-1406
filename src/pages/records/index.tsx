import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import RecordItem from '@/components/RecordItem';
import { mockRecords } from '@/data/mockRecords';
import type { TestStatus } from '@/types';

const FILTERS: { key: TestStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pass', label: '可发车' },
  { key: 'retest', label: '需复测' },
  { key: 'fail', label: '禁止发车' },
  { key: 'exception', label: '异常' }
];

const RecordsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<TestStatus | 'all'>('all');

  const summary = useMemo(() => {
    const pass = mockRecords.filter((r) => r.status === 'pass').length;
    const retest = mockRecords.filter((r) => r.status === 'retest').length;
    const exception = mockRecords.filter(
      (r) => r.status === 'fail' || r.status === 'exception'
    ).length;
    return { pass, retest, exception };
  }, []);

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return mockRecords;
    return mockRecords.filter((r) => r.status === activeFilter);
  }, [activeFilter]);

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

        <ScrollView scrollX className={styles.filterTabs}>
          {FILTERS.map((f) => (
            <View
              key={f.key}
              className={classnames(styles.filterTab, activeFilter === f.key && styles.active)}
              onClick={() => setActiveFilter(f.key)}
            >
              <Text>{f.label}</Text>
            </View>
          ))}
        </ScrollView>
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
