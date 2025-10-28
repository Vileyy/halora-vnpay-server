const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const qs = require("qs");

const app = express();
app.use(cors());
app.use(express.json());

const vnp_TmnCode = "2QXUI4J4"; // mã VNPAY sandbox
const vnp_HashSecret = "SECRETKEYDEMO"; // khóa bí mật sandbox
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "https://halora.web.app/vnpay_return"; // URL redirect về app của em

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

app.get("/", (req, res) => {
  res.send("✅ VNPay Server Running...");
});

app.post("/create-vnpay-payment", (req, res) => {
  const { amount, orderId } = req.body;

  const date = new Date();
  const createDate = `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${(
    "0" + date.getDate()
  ).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(
    -2
  )}${("0" + date.getSeconds()).slice(-2)}`;

  // Dữ liệu gửi sang VNPAY
  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: "Thanh toan don hang Halora",
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: "0.0.0.0",
    vnp_CreateDate: createDate,
  };

  // Bắt buộc sort theo thứ tự key ASCII
  vnp_Params = sortObject(vnp_Params);

  // ⚡️Đây là điểm khác biệt chính — stringify KHÔNG encode
  const signData = qs.stringify(vnp_Params, { encode: false });

  // Tạo secure hash SHA512
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Gắn vào param
  vnp_Params["vnp_SecureHash"] = signed;

  // ⚡️Phải encode lại URL khi gửi đi
  const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: true })}`;

  res.json({ paymentUrl });
});

app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
