import { useState } from 'react'
import { Segmented } from '../../components/ui/Segmented'
import { ReportPrintable } from './ReportPrintable'
import { ComparePage } from '../compare/ComparePage'

type Tab = 'laporan' | 'banding'

export function ReportPage() {
  const [tab, setTab] = useState<Tab>('laporan')

  return (
    <div className="report-wrap mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <Segmented<Tab>
        className="no-print mb-4 w-full"
        options={[
          { value: 'laporan', label: 'Cetak Laporan' },
          { value: 'banding', label: 'Bandingkan Periode' }
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'laporan' ? <ReportPrintable /> : <ComparePage />}
    </div>
  )
}
