AE lưu ý cần tải file serviceaccount key trên firbase, trong mục project setting > Service accounts > Generate new private key, máy sẽ tải xuống 1 file json. Sau đó pull về và cho file service account vào chung một folder với các file đã pull trên là được.
File service accounts sẽ có tên là: hlearnhub-testing-firebase-admin.....json.
AE tải thêm một vài thư viện để chạy được (bên cạnh node.js) theo cú pháp: npm install tên thư viện. Trong đó phải tải các file sau:
1. axios
2. cors
3. firebase admin
Nếu có thiếu thư viện gì thì ae cứ tự tải thêm nhé, nó sẽ báo qua lỗi, vì file này hiện tại tôi đã fix để chạy được với localhost rồi, mà tôi cũng ko nhớ hết các thư viện cần tải 