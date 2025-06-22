// D:\Wdp301\wdp301\Frontend\src\pages\CreateReportPage.jsx

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { customFetch } from "@/utils/customAxios";

// Import useAuth từ Clerk ngay tại đây
import { useAuth } from '@clerk/clerk-react'; 

const CreateReportPage = () => {
    // State cho các trường của form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reportType, setReportType] = useState('');
    const [itemId, setItemId] = useState('');
    const [rating, setRating] = useState('');
    const [reportedUserId, setReportedUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Lấy userId từ hook useAuth của Clerk
    const { userId } = useAuth(); 

    // Gán userId đã lấy được vào biến mà bạn sẽ dùng trong handleSubmit
    const currentUserId = userId; 

    // Hàm xử lý khi thay đổi loại báo cáo
    const handleReportTypeChange = (value) => {
        setReportType(value);
        // Reset các trường phụ thuộc khi thay đổi loại báo cáo
        setItemId('');
        setRating('');
        setReportedUserId('');
    };

    // Hàm xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Kiểm tra xem userId có tồn tại không trước khi gửi
        if (!currentUserId) {
            toast.error("Vui lòng đăng nhập để gửi báo cáo.");
            setIsLoading(false);
            return;
        }

        const reportData = {
            title,
            description,
            userId: currentUserId, // Sử dụng userId thực tế từ Clerk
            reportType,
        };

        // Thêm các trường có điều kiện
        if (reportType === 'item_feedback') {
            reportData.itemId = itemId;
            // Kiểm tra và parse rating
            const parsedRating = parseInt(rating, 10);
            if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                toast.error("Đánh giá số sao phải là một số hợp lệ từ 1 đến 5.");
                setIsLoading(false);
                return;
            }
            reportData.rating = parsedRating;
        } else if (reportType === 'user_behavior' || reportType === 'spam') {
            reportData.reportedUserId = reportedUserId;
        }

        // --- VALIDATION PHÍA CLIENT THÊM ---
        // Đảm bảo các trường cần thiết cho từng loại báo cáo không rỗng
        if (reportType === 'item_feedback' && (!reportData.itemId || isNaN(reportData.rating))) {
            toast.error("Vui lòng nhập ID sản phẩm và đánh giá số sao.");
            setIsLoading(false);
            return;
        }
        if ((reportType === 'user_behavior' || reportType === 'spam') && !reportData.reportedUserId) {
            toast.error("Vui lòng nhập ID người dùng bị báo cáo.");
            setIsLoading(false);
            return;
        }
        // --- KẾT THÚC VALIDATION PHÍA CLIENT ---


        try {
            // Sử dụng customFetch của bạn
            const response = await customFetch.post('/reports', reportData); 

            toast.success(response.data.message || 'Báo cáo đã được gửi thành công!');
            // Reset form sau khi gửi thành công
            setTitle('');
            setDescription('');
            setReportType('');
            setItemId('');
            setRating('');
            setReportedUserId('');

        } catch (error) {
            console.error('Lỗi khi gửi báo cáo:', error);
            let errorMessage = 'Đã xảy ra lỗi khi gửi báo cáo.';

            if (error.response) {
                // Lỗi từ server (có response)
                const { data, status } = error.response;
                if (data.message) {
                    errorMessage = data.message;
                } else if (data.errors && data.errors.length > 0) {
                    // Xử lý lỗi validation từ express-validator
                    errorMessage = data.errors.map(err => err.msg || err.message).join('<br>');
                }

                if (status === 429) {
                    errorMessage = 'Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau.';
                } else if (data.violationDetected) {
                    errorMessage = 'Nội dung báo cáo của bạn bị từ chối do vi phạm chính sách.';
                }
            } else if (error.request) {
                // Yêu cầu đã được gửi nhưng không nhận được phản hồi (ví dụ: server down)
                errorMessage = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.';
            } else {
                // Lỗi khác (ví dụ: cấu hình request sai)
                errorMessage = 'Đã xảy ra lỗi không mong muốn.';
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-6">Gửi Báo Cáo Mới</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Tiêu đề báo cáo:</Label>
                        <Input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả chi tiết:</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="userId">ID người dùng của bạn (Clerk ID):</Label>
                        <Input
                            id="userId"
                            type="text"
                            value={currentUserId || 'Đang tải...'} 
                            readOnly 
                            className="bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reportType">Loại báo cáo:</Label>
                        <Select onValueChange={handleReportTypeChange} value={reportType} required>
                            <SelectTrigger id="reportType">
                                <SelectValue placeholder="-- Chọn loại báo cáo --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="item_feedback">Phản hồi về sản phẩm</SelectItem>
                                <SelectItem value="user_behavior">Hành vi người dùng</SelectItem>
                                <SelectItem value="spam">Báo cáo Spam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Các trường có điều kiện */}
                    {(reportType === 'item_feedback') && (
                        <div className="border border-dashed p-4 rounded-md bg-gray-50 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-700">Thông tin sản phẩm</h3>
                            <div className="grid gap-2">
                                <Label htmlFor="itemId">ID sản phẩm:</Label>
                                <Input
                                    id="itemId"
                                    type="text"
                                    value={itemId}
                                    onChange={(e) => setItemId(e.target.value)}
                                    placeholder="Ví dụ: 60d5ec49f8c6e2a2c8f8b456" 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rating">Đánh giá (1-5 sao):</Label>
                                <Input
                                    id="rating"
                                    type="number"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    min="1"
                                    max="5"
                                />
                            </div>
                        </div>
                    )}

                    {(reportType === 'user_behavior' || reportType === 'spam') && (
                        <div className="border border-dashed p-4 rounded-md bg-gray-50 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-700">Thông tin người dùng bị báo cáo</h3>
                            <div className="grid gap-2">
                                <Label htmlFor="reportedUserId">ID người dùng bị báo cáo (Clerk ID):</Label>
                                <Input
                                    id="reportedUserId"
                                    type="text"
                                    value={reportedUserId}
                                    onChange={(e) => setReportedUserId(e.target.value)}
                                    placeholder="Ví dụ: user_2Q8L3N4P5R6S7T8U9V0W1X2Y3Z4A5B" 
                                />
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateReportPage;