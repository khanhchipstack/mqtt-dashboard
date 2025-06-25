"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";

const DashboardWarning = () => {
  return (
    <Card className="bg-yellow-100/10 border border-yellow-500 shadow-lg mb-6 rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-yellow-500/20 border border-yellow-500 rounded-full">
            <AlertTriangle className="text-yellow-400 w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-yellow-400 text-lg font-semibold">
              Lưu ý: Đây là Server thử nghiệm
            </h3>
            <p className="text-sm text-yellow-200 leading-relaxed">
              Máy chủ này chỉ dành cho mục đích kiểm thử. 
              Mỗi kết nối có giới hạn <b>60 phút</b>, sau đó sẽ bị chặn tạm thời <b>60 phút</b>. 
              Mỗi địa chỉ IP được phép tối đa <b>5 kết nối đồng thời</b>. 
              Tốc độ truyền dữ liệu giới hạn ở <b>3KB/s</b>. 
              Server có thể được bảo trì bất kỳ lúc nào mà không cần thông báo trước. 
              Chúng tôi không cam kết SLA, mong quý khách hàng thông cảm.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWarning;
