#include <string>

#include <iostream>
#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/highgui.hpp>
//#include <emscripten.h>


using namespace cv;
using namespace std;


extern "C"{

RNG rng(12345);

int *process(size_t addr, int width, int height);


int *process(size_t addr, int width, int height)
{
	//cv::Mat src;
	cv::Mat dst;

    cv::Size size= cv::Size(300,300); 


    auto data = reinterpret_cast<void *>(addr);
    cv::Mat src(height, width, CV_8UC4, data); // RGBA

    cv::cvtColor(src, dst, cv::COLOR_RGBA2BGR);

    cv::resize(dst, dst, size, cv::INTER_LINEAR);

    cv::cvtColor(dst, dst, cv::COLOR_BGR2GRAY);
    cv::cvtColor(dst, dst, cv::COLOR_BGRA2BGR);


    cv::GaussianBlur( dst, dst, cv::Size(5,5), cv::BORDER_DEFAULT);



    cv::cvtColor(dst, dst, cv::COLOR_BGR2GRAY);
    //cv::Canny( dst, dst, lowThreshold, lowThreshold*ratio, kernel_size );
    cv::Canny( dst, dst, 60, 35, 3 );
    cv::threshold( dst, dst, 120, 200, cv::THRESH_BINARY );

    vector<vector<cv::Point> > contours;
    vector<cv::Vec4i> hierarchy;
    cv::findContours( dst, contours, hierarchy, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE );
    cv::Mat drawing = cv::Mat::zeros( dst.size(), CV_8UC3 );
    for( size_t i = 0; i< contours.size(); i++ )
    {
        cv::Scalar color = cv::Scalar( rng.uniform(0, 256), rng.uniform(0,256), rng.uniform(0,256) );
        cv::drawContours( dst, contours, (int)i, color, 1, LINE_8, hierarchy, 0 );
    }


    /*uint totalElements = dst.total()*dst.channels(); // Note: image.total() == rows*cols.
    cv::Mat flat = dst.reshape(1, totalElements); // 1xN mat of 1 channel, O(1) operation
    if(!dst.isContinuous()) {
        flat = flat.clone(); // O(N),
    }

    auto * ptr = flat.data; // usually, its uchar*
    // You have your array, its length is flat.total() [rows=1, cols=totalElements]
    // Converting to vector
    std::vector<int> vec(flat.data, flat.data + flat.total());


    //register_vector<nftPoint>("nftPointVector");

    //cv::imshow("myCanvas2", dst);
    */
    
    std::cout << dst << std::endl;
    std::cout << "------------" << std::endl;
    //std::cout << &ptr << std::endl;

    int return_image_1_width = dst.cols;
    int return_image_1_height = dst.rows;
    int return_image_1_channels = dst.channels();
    int return_image_1_size = return_image_1_width * return_image_1_height * return_image_1_channels;

    int return_data_size = 4 * sizeof(int) + return_image_1_size;
    int *return_data = static_cast<int*>(malloc(return_data_size));
    uchar *return_image_1_addr = reinterpret_cast<uchar*>(&return_data[4]);

    memcpy(return_image_1_addr, dst.data, return_image_1_size);

    return_data[0] = return_image_1_width;
    return_data[1] = return_image_1_height;
    return_data[2] = return_image_1_channels;
    return_data[3] = reinterpret_cast<int>(return_image_1_addr);

    return return_data;



    }




int main(int argc, char* argv[]) {
    
    return 0;
}
}
