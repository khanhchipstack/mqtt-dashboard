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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SystemIntroduction() {
  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 mx-auto w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Network className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              FreeMQTT by Chipstack
            </h1>
          </div>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
            <strong className="text-white">FreeMQTT by Chipstack</strong> là hệ
            thống frontend hiện đại hỗ trợ kết nối, giám sát và vận hành MQTT
            cho IoT. Hỗ trợ cả MQTT 3.1.1 và MQTT 5.0, cung cấp giao diện trực
            quan để quản lý kết nối, publish/subscribe dữ liệu thời gian thực và
            tích hợp WebSocket/WSS an toàn.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Badge className="bg-green-600 px-3 py-1 text-xs sm:text-sm">
              MQTT 3.1.1 & 5.0
            </Badge>
            <Badge className="bg-blue-600 px-3 py-1 text-xs sm:text-sm">
              Realtime Monitoring
            </Badge>
            <Badge className="bg-yellow-500 px-3 py-1 text-xs sm:text-sm">
              WebSocket / Secure WSS
            </Badge>
            <Badge className="bg-purple-600 px-3 py-1 text-xs sm:text-sm">
              User Properties
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 sm:w-6 sm:h-6" /> Thông Tin Kết Nối
          </h2>
          <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-2">
            <li>
              <strong>Host:</strong> freemqtt.chipstack.vn
            </li>
            <li>
              <strong>MQTT:</strong> mqtt://freemqtt.chipstack.vn:1883
            </li>
            <li>
              <strong>MQTTS:</strong> mqtts://freemqtt.chipstack.vn:8883
            </li>
            <li>
              <strong>WebSocket:</strong> ws://freemqtt.chipstack.vn:8083
            </li>
            <li>
              <strong>Secure WebSocket:</strong>{" "}
              wss://freemqtt.chipstack.vn:8884
            </li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" /> Luồng Hoạt Động
          </h2>
          <ol className="list-decimal list-inside text-gray-300 text-sm sm:text-base space-y-2">
            <li>
              Tạo kết nối với đầy đủ thông tin (Host, Port, Client ID, v.v.)
            </li>
            <li>Thực hiện CONNECT tới broker</li>
            <li>SUBSCRIBE topic cần lắng nghe dữ liệu</li>
            <li>PUBLISH hoặc nhận dữ liệu thời gian thực</li>
            <li>DISCONNECT khi hoàn tất hoặc cần ngắt kết nối</li>
          </ol>

          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" /> Thông Số Kỹ Thuật
            Chi Tiết
          </h2>
          <Accordion type="single" collapsible className="text-gray-300">
            <AccordionItem
              value="connect"
              className="bg-gray-900 rounded-xl border border-gray-800 px-2 mt-2"
            >
              <AccordionTrigger className="text-sm sm:text-base">
                1. Thông Số Kết Nối (CONNECT)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                  <li>
                    <strong>Client ID:</strong> Định danh duy nhất cho client
                    (UTF-8, 1-23 ký tự, hoặc dài hơn tùy broker). (Thường là
                    chuỗi ngẫu nhiên do client tạo, hỗ trợ 1-65535 ký tự){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Username / Password:</strong> Thông tin xác thực để
                    đăng nhập vào broker. (Không bắt buộc, hỗ trợ chuỗi UTF-8
                    đến 65535 ký tự cho cả hai){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Clean Session:</strong> Xóa session cũ khi reconnect
                    (true: xóa, false: giữ). (Thường bật, chọn true hoặc false){" "}
                    <Badge className="bg-green-600">MQTT 3</Badge>
                  </li>
                  <li>
                    <strong>Clean Start:</strong> Tương tự Clean Session, dùng
                    để xóa hoặc giữ session. (Thường bật, chọn true hoặc false){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Session Expiry Interval:</strong> Thời gian (giây)
                    giữ session sau khi disconnect (0: kết thúc ngay,
                    0xFFFFFFFF: không hết hạn). (Thường là 0, từ 0 đến
                    4294967295) <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Keepalive:</strong> Thời gian (giây) gửi PINGREQ để
                    duy trì kết nối. (Thường là 60 giây, từ 0 đến 65535){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Reconnect Period:</strong> Thời gian (ms) chờ trước
                    khi thử reconnect tự động. (Thường là 1000ms, từ 0 đến
                    60000ms) <Badge className="bg-green-600">MQTTX</Badge>
                  </li>
                  <li>
                    <strong>Connect Timeout:</strong> Thời gian (ms) tối đa chờ
                    phản hồi CONNACK từ broker. (Thường là 30000ms, từ 1000 đến
                    60000ms) <Badge className="bg-green-600">MQTTX</Badge>
                  </li>
                  <li>
                    <strong>Protocol:</strong> Loại giao thức: mqtt, mqtts, ws,
                    wss. (Thường là mqtt, chọn một trong mqtt/mqtts/ws/wss){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Protocol Version:</strong> 4 (MQTT 3.1.1) hoặc 5
                    (MQTT 5.0). (Thường là 4, chọn 4 hoặc 5){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Use SSL:</strong> Bật/tắt SSL/TLS cho kết nối an
                    toàn. (Thường tắt, chọn true hoặc false){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Reject Unauthorized:</strong> Từ chối chứng chỉ SSL
                    không hợp lệ. (Thường bật, chọn true hoặc false){" "}
                    <Badge className="bg-green-600">MQTTX</Badge>
                  </li>
                  <li>
                    <strong>CA / Cert / Key:</strong> Chứng chỉ CA, client
                    certificate, và private key cho xác thực TLS. (Không bắt
                    buộc, dùng chuỗi định dạng PEM){" "}
                    <Badge className="bg-green-600">MQTTX</Badge>
                  </li>
                  <li>
                    <strong>Receive Maximum:</strong> Số lượng tối đa QoS 1/2
                    messages nhận đồng thời. (Thường là 65535, từ 1 đến 65535){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Maximum Packet Size:</strong> Kích thước tối đa
                    (byte) của packet mà client chấp nhận. (Thường không giới
                    hạn, từ 0 đến 4294967295){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Topic Alias Maximum:</strong> Số lượng topic alias
                    tối đa mà client hỗ trợ. (Thường là 0, từ 0 đến 65535){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Request Response Information:</strong> Yêu cầu
                    broker gửi thông tin response topic. (Thường tắt, chọn true
                    hoặc false) <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Request Problem Information:</strong> Yêu cầu broker
                    gửi thông tin lỗi chi tiết. (Thường bật, chọn true hoặc
                    false) <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>User Properties:</strong> Cặp key-value tùy chỉnh
                    cho metadata. (Không bắt buộc, dùng chuỗi UTF-8, ví dụ:
                    name: "chipstack"){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="will"
              className="bg-gray-900 rounded-xl border border-gray-800 px-2 mt-2"
            >
              <AccordionTrigger className="text-sm sm:text-base">
                2. Will Message (Khi Disconnect Bất Thường)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                  <li>
                    <strong>Will Topic:</strong> Chủ đề để gửi Will Message khi
                    client ngắt bất thường. (Không bắt buộc, dùng chuỗi UTF-8 từ
                    1 đến 65535 ký tự){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Payload:</strong> Nội dung của Will Message.
                    (Không bắt buộc, hỗ trợ chuỗi hoặc dữ liệu nhị phân đến
                    65535 byte){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will QoS:</strong> Chất lượng dịch vụ (0, 1, 2) cho
                    Will Message. (Thường là 0, chọn 0, 1 hoặc 2){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Retain:</strong> Giữ lại Will Message trên
                    broker. (Thường tắt, chọn true hoặc false){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Will Delay Interval:</strong> Thời gian (giây) trì
                    hoãn gửi Will Message. (Thường là 0, từ 0 đến 4294967295){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Message Expiry Interval:</strong> Thời gian
                    (giây) Will Message tồn tại trên broker. (Không bắt buộc, từ
                    0 đến 4294967295){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Content Type:</strong> Kiểu dữ liệu của Will
                    Message (ví dụ: <code>application/json</code>). (Không bắt
                    buộc, dùng chuỗi UTF-8 đến 65535 ký tự){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Response Topic:</strong> Chủ đề phản hồi cho
                    Will Message. (Không bắt buộc, dùng chuỗi UTF-8 từ 1 đến
                    65535 ký tự) <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Correlation Data:</strong> Dữ liệu liên kết cho
                    Will Message (ví dụ: UUID). (Không bắt buộc, hỗ trợ dữ liệu
                    nhị phân đến 65535 byte){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will Payload Format Indicator:</strong> Xác định
                    payload là text hoặc nhị phân. (Thường là 0, chọn 0 hoặc 1){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Will User Properties:</strong> Cặp key-value tùy
                    chỉnh cho Will Message. (Không bắt buộc, dùng chuỗi UTF-8,
                    ví dụ: name: "chipstack"){" "}
                    <Badge className="bg-yellow-500">MRI 5</Badge>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="subscribe"
              className="bg-gray-900 rounded-xl border border-gray-800 px-2 mt-2"
            >
              <AccordionTrigger className="text-sm sm:text-base">
                3. Thông Số Đăng Ký Topic (SUBSCRIBE)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                  <li>
                    <strong>Topic Filter:</strong> Tên topic hoặc pattern (có
                    thể dùng wildcards +/#). (Không bắt buộc, dùng chuỗi UTF-8
                    từ 1 đến 65535 ký tự){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Subscriber QoS:</strong> Chất lượng dịch vụ (0, 1,
                    2) khi nhận message. (Thường là 0, chọn 0, 1 hoặc 2){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>No Local:</strong> Không nhận message từ chính
                    client gửi. (Thường tắt, chọn true hoặc false){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Retain As Published:</strong> Giữ nguyên trạng thái
                    retain của message. (Thường tắt, chọn true hoặc false){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Retain Handling:</strong> Cách xử lý retained
                    messages khi subscribe (0: gửi luôn, 1: chỉ gửi cho
                    subscription mới, 2: không gửi). (Thường là 0, chọn 0, 1
                    hoặc 2) <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Subscription Identifier:</strong> Định danh số cho
                    subscription, giúp phân biệt khi xử lý. (Không bắt buộc, từ
                    1 đến 268435455){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="publish"
              className="bg-gray-900 rounded-xl border border-gray-800 px-2 mt-2"
            >
              <AccordionTrigger className="text-sm sm:text-base">
                4. Thông Số Gửi Dữ Liệu (PUBLISH)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                  <li>
                    <strong>Topic Name:</strong> Chủ đề gửi dữ liệu. (Không bắt
                    buộc, dùng chuỗi UTF-8 từ 1 đến 65535 ký tự){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Publish Message Payload:</strong> Nội dung message
                    (text, JSON, binary, v.v.). (Không bắt buộc, hỗ trợ đến
                    268435456 byte){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Publish QoS:</strong> Chất lượng dịch vụ (0, 1, 2)
                    khi gửi message. (Thường là 0, chọn 0, 1 hoặc 2){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Retain:</strong> Giữ lại message trên broker cho
                    subscriber mới. (Thường tắt, chọn true hoặc false){" "}
                    <Badge className="bg-green-600">MQTT 3 & 5</Badge>
                  </li>
                  <li>
                    <strong>Message Expiry Interval:</strong> Thời gian (giây)
                    message tồn tại trên broker. (Không bắt buộc, từ 0 đến
                    4294967295) <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Topic Alias:</strong> Số định danh thay thế topic để
                    giảm băng thông. (Thường là 0, từ 0 đến 65535){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Content Type:</strong> Kiểu dữ liệu của payload (ví
                    dụ: <code>application/json</code>). (Không bắt buộc, dùng
                    chuỗi UTF-8 đến 65535 ký tự){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Payload Format Indicator:</strong> Xác định payload
                    là text hoặc nhị phân. (Thường là 0, chọn 0 hoặc 1){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Response Topic:</strong> Chủ đề để nhận phản hồi
                    trong mô hình request-response. (Không bắt buộc, dùng chuỗi
                    UTF-8 từ 1 đến 65535 ký tự){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>Correlation Data:</strong> Dữ liệu liên kết (ví dụ:
                    UUID) để khớp request-response. (Không bắt buộc, hỗ trợ dữ
                    liệu nhị phân đến 65535 byte){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                  <li>
                    <strong>User Properties:</strong> Cặp key-value tùy chỉnh
                    cho metadata. (Không bắt buộc, dùng chuỗi UTF-8, ví dụ:
                    name: "chipstack"){" "}
                    <Badge className="bg-yellow-500">MQTT 5</Badge>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-4 sm:pt-6">
            <Link href="/mqtt">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
                Bắt Đầu Kết Nối <SendHorizonal className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
