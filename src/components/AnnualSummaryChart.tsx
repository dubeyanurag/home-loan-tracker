// src/components/AnnualSummaryChart.tsx
import React, { useState, useRef } from 'react'; 
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TooltipItem // Import TooltipItem
} from 'chart.js';
import { AnnualSummary } from '../types';
import styled from 'styled-components';
import { useAppState } from '../contexts/AppContext'; // Import useAppState
import { formatCurrency } from '../utils/formatting'; // Import formatCurrency

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartWrapper = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9; 
  height: 350px; 
  position: relative;

  @media (max-width: 768px) {
    height: 280px; 
  }

  @media (max-width: 480px) {
    height: 220px; 
    padding: 10px; 
  }
  
  &.fullscreen { 
    padding: 10px;
    height: 100vh !important;
    width: 100vw !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 2000 !important;
    background-color: #fff !important;
    overflow: hidden;
  }
`;

const ChartControls = styled.div`
  position: absolute;
  top: 5px;
  right: 10px;
  z-index: 10;
`;

const ControlButton = styled.button`
    padding: 3px 8px;
    font-size: 0.8em;
    cursor: pointer;
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
     &:hover {
        background-color: #ddd;
     }
`;

interface AnnualSummaryChartProps {
  annualSummaries: AnnualSummary[];
}

const AnnualSummaryChart: React.FC<AnnualSummaryChartProps> = ({ annualSummaries }) => {
  const { currency } = useAppState(); // Get currency
  const chartWrapperRef = useRef<HTMLDivElement>(null); 
  const chartRef = useRef<ChartJS<'bar'>>(null); 
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximizedView = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) { 
      window.scrollTo(0, 0);
    }
    setTimeout(() => {
        chartRef.current?.resize(); 
    }, 50);
  };

  if (!annualSummaries || annualSummaries.length === 0) {
    return <p>No annual summary data available for chart.</p>;
  }

  const labels = annualSummaries.map(summary => summary.yearLabel);
  
  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Total Principal Paid',
        data: annualSummaries.map(s => s.totalPrincipalPaid),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Interest Paid (Regular + Pre-EMI)',
        data: annualSummaries.map(s => s.totalInterestPaid + s.totalPreEMIInterestPaid),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Prepayments Made',
        data: annualSummaries.map(s => s.totalPrepaymentsMade),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'bottom' as const, 
      },
      title: {
        display: true,
        text: 'Annual Loan Summary Overview',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) { // Typed context
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y, currency); // Use formatCurrency
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false, 
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: `Amount (${currency})` // Add currency to axis title
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(Number(value), currency); // Use formatCurrency
          }
        }
      },
    },
  };

  return (
    <ChartWrapper ref={chartWrapperRef} className={isMaximized ? 'fullscreen' : ''}> 
      <ChartControls>
        <ControlButton onClick={toggleMaximizedView}>
          {isMaximized ? 'Exit Maximize' : 'Maximize'}
        </ControlButton>
      </ChartControls>
      <Bar ref={chartRef} options={options} data={data} />
    </ChartWrapper>
  );
};

export default AnnualSummaryChart;
