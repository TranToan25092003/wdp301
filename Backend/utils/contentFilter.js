// src/utils/contentFilter.js

/**
 * Hàm giả định để phát hiện spam hoặc nội dung không phù hợp.
 * Trong thực tế, bạn sẽ tích hợp các dịch vụ/thư viện AI/ML tại đây.
 *
 * @param {string} text - Văn bản cần kiểm tra.
 * @returns {Promise<boolean>} - True nếu phát hiện spam/nội dung không phù hợp, ngược lại False.
 */
async function detectSpamContent(text) {
    // Chuyển đổi văn bản sang chữ thường để kiểm tra không phân biệt chữ hoa/thường
    const lowerText = text.toLowerCase();

    // Danh sách các từ khóa hoặc cụm từ bị cấm (ví dụ)
    const bannedKeywords = [
        'sex', 'cần thơ', 'mại dâm', 'lừa đảo', 'hack', 'crack', 'thuốc lá',
        'ma túy', 'chất cấm', 'kỳ thị', 'phân biệt', 'đả kích', 'xâm hại',
        'rác', 'spam', 'vi phạm', 'khỏa thân', 'tình dục', 'bạo lực',
        'đe dọa', 'tuyệt mật', 'nhạy cảm', 'quấy rối', 'chửi bới', 'đồi trụy'
    ];

    // Kiểm tra xem văn bản có chứa bất kỳ từ khóa cấm nào không
    for (const keyword of bannedKeywords) {
        if (lowerText.includes(keyword)) {
            console.log(`[Content Filter] Detected banned keyword: "${keyword}" in text: "${text}"`);
            return true; // Phát hiện nội dung spam/không phù hợp
        }
    }

    // Các quy tắc phức tạp hơn có thể được thêm vào đây, ví dụ:
    // - Phát hiện các URL không mong muốn
    // - Kiểm tra mật độ từ khóa
    // - Tích hợp API của Google Perspective API, AWS Comprehend, Azure Content Moderator, v.v.

    // Nếu không có gì bị phát hiện, trả về false
    return false;
}

module.exports = {
    detectSpamContent
};