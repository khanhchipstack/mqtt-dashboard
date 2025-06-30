import { Layout } from "@/components/layout/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Network,
  Server,
  BarChart2,
  Shuffle,
  Settings2,
  SendHorizonal,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function SystemIntroduction() {
  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Network className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              FreeMQTT by Chipstack
            </h1>
          </div>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
            <strong className="text-white"> FreeMQTT by Chipstack</strong> là hệ
            thống frontend hiện đại, trực quan giúp bạn dễ dàng kết nối, giám
            sát và vận hành hệ thống MQTT. Hỗ trợ đầy đủ WebSocket, WSS, cùng
            API thống kê realtime giúp tối ưu quản lý thiết bị và dữ liệu IoT.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3.1.1 & 5.0</Badge>
            <Badge className="bg-blue-600 px-3 py-1 text-xs sm:text-sm">Realtime Monitoring</Badge>
            <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">
              WebSocket / Secure WSS
            </Badge>
          </div>

          {/* Thông Tin Kết Nối */}
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 sm:w-6 sm:h-6" /> Thông Tin Kết Nối
          </h2>
          <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-2">
            <li>
              <strong>Host:</strong>{" "}
              <span className="text-green-400">https://freemqtt.chipstack.vn/</span>
            </li>
            <li>
              <strong>MQTT over MQTT :</strong>{" "}
              <span className="text-blue-400">http://https://freemqtt.chipstack.vn:1883</span>
            </li>
            <li>
              <strong>MQTT over MQTTS :</strong>{" "}
              <span className="text-yellow-400">http://https://freemqtt.chipstack.vn:8883</span>
            </li>
            <li>
              <strong>MQTT over WS:</strong>{" "}
              <span className="text-blue-400">ws://https://freemqtt.chipstack.vn:8083</span>
            </li>
            <li>
              <strong>MQTT over WSS:</strong>{" "}
              <span className="text-yellow-400">wss://https://freemqtt.chipstack.vn:8884</span>
            </li>

          </ul>

          {/* Luồng Hoạt Động */}
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" /> Luồng Hoạt Động Hệ Thống
          </h2>
          <ol className="list-decimal list-inside text-gray-300 text-sm sm:text-base space-y-2">
            <li>
              <strong>Tạo Connection:</strong> Khai báo thông tin kết nối, chọn
              giao thức phù hợp
            </li>
            <li>
              <strong>Connect:</strong> Tiến hành kết nối tới broker
            </li>
            <li>
              <strong>Subscribe Topic:</strong> Đăng ký lắng nghe dữ liệu từ các
              topic
            </li>
            <li>
              <strong>Publish & Receive Message:</strong> Gửi và nhận dữ liệu
              thời gian thực
            </li>
          </ol>

          {/* Tính Năng Nổi Bật */}
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" /> Tính Năng Nổi Bật
          </h2>
          <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-2">
            <li>Kết nối MQTT nhanh chóng qua WebSocket hoặc Secure WSS</li>
            <li>Giám sát thông số hệ thống realtime từ API</li>
            <li>Subscribe và Publish dữ liệu thời gian thực</li>
            <li>Hỗ trợ giao thức MQTT 3.1.1 và MQTT 5.0</li>
            <li>Giao diện hiện đại, tối ưu trải nghiệm người dùng</li>
            <li>Hỗ trợ quản lý nhiều topic và subscriber đồng thời</li>
            <li>Cho phép publish message với QoS tùy chỉnh (0, 1, 2)</li>
          </ul>

          {/* Thông Số Kỹ Thuật Chi Tiết */}
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" /> Thông Số Kỹ Thuật Chi Tiết
          </h2>
          <Accordion type="single" collapsible className="text-gray-300">
            <AccordionItem value="mqtt3" className="bg-gray-900 rounded-xl border border-gray-800 px-2">
              <AccordionTrigger className="text-sm sm:text-base">MQTT 3.1.1</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                  <li>
                    <strong>Name:</strong> Tên hiển thị cho kết nối{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Host:</strong> Địa chỉ broker{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Port:</strong> Cổng kết nối phù hợp (1883, 8883, 9999...){" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Protocol:</strong> mqtt / mqtts / ws / wss{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Client ID:</strong> Định danh duy nhất cho client{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Username / Password:</strong> Thông tin xác thực nếu cần{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Clean Session:</strong> Chọn giữ hoặc xóa session khi reconnect{" "}
                    <Badge className="bg-indigo-500 px-3 py-1 text-xs sm:text-sm">MQTT 3</Badge>
                  </li>
                  <li>
                    <strong>Keepalive:</strong> Thời gian gửi ping giữ kết nối (giây){" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Connect Timeout:</strong> Thời gian tối đa chờ kết nối{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Reconnect Period:</strong> Thời gian tự reconnect nếu mất kết nối{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Use SSL:</strong> Sử dụng mã hóa SSL/TLS bảo mật{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Protocol Version:</strong> 4 (MQTT 3.1.1) hoặc 5 (MQTT 5.0){" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Message:</strong> Tin nhắn gửi khi disconnect bất thường{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Topic:</strong> Chủ đề của Will Message{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Payload:</strong> Nội dung tin nhắn{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will QoS:</strong> QoS cho Will Message (0, 1, 2){" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Retain:</strong> Giữ lại Will Message trên broker{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Reject Unauthorized:</strong> Từ chối kết nối nếu chứng chỉ không hợp lệ{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>CA, Cert, Key:</strong> Các chứng chỉ bảo mật SSL/TLS{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Topic Name:</strong> Tên topic để subscribe hoặc publish{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Subscriber QoS:</strong> Chất lượng dịch vụ cho subscriber (0, 1, 2){" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Publish Message Payload:</strong> Nội dung tin nhắn publish{" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Publish QoS:</strong> Chất lượng dịch vụ cho publish (0, 1, 2){" "}
                    <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">MQTT 3 & 5</Badge>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mqtt5" className="bg-gray-900 rounded-xl border border-gray-800 px-2 mt-2">
              <AccordionTrigger className="text-sm sm:text-base">MQTT 5.0</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                  <li>
                    <strong>Session Expiry Interval:</strong> Thời gian session tồn tại sau disconnect{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Receive Maximum:</strong> Giới hạn số gói tin nhận cùng lúc{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Maximum Packet Size:</strong> Kích thước tối đa mỗi gói tin{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Topic Alias Maximum:</strong> Số lượng alias tối đa cho topic{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Request Response Information:</strong> Yêu cầu broker cung cấp phản hồi chi tiết{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Request Problem Information:</strong> Nhận thông tin chi tiết khi có lỗi{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>User Properties:</strong> Thuộc tính mở rộng dưới dạng JSON{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Delay Interval:</strong> Thời gian trễ gửi Will Message{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Message Expiry Interval:</strong> Thời gian tồn tại Will Message{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Content Type:</strong> Kiểu định dạng nội dung{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Response Topic:</strong> Chủ đề phản hồi từ broker{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Correlation Data:</strong> Dữ liệu liên kết giao tiếp{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Payload Format Indicator:</strong> Định dạng payload nhị phân hoặc text{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will User Properties:</strong> Thuộc tính mở rộng cho Will Message{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Subscription Identifier:</strong> Định danh cho subscription{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>No Local:</strong> Không nhận tin nhắn từ chính client gửi{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Retain As Published:</strong> Giữ nguyên thuộc tính retain của tin nhắn{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Retain Handling:</strong> Xử lý tin nhắn retain khi subscribe{" "}
                    <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">MQTT 5</Badge>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-4 sm:pt-6">
            <Link href="/mqtt">
              <Button className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white px-4 sm:px-6 py-2 text-sm sm:text-base transition-colors duration-200">
                Bắt Đầu Kết Nối <SendHorizonal className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}