import { Metadata } from "next";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: 'Thanh toán đơn hàng - FoodDeli',
  description: 'Hoàn tất đơn hàng của bạn',
};

import { Suspense } from 'react';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentClient />
    </Suspense>
  );
}