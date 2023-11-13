import xml.etree.ElementTree as ET
import numpy as np
import cv2

path = "trajectories.xml"
# path_matrix = "C:\\Users\\alexr\\Documents\\GitHub\\BA-Riedlinger-DanceTrajectories\\transformation\\matrix.txt"

# with open(path_matrix, "r") as file:
#     lines = file.readlines()

# transformationmatrix = np.zeros((3, 3))

# for i in range(3):
#     values = lines[i].split()
#     for j in range(3):
#         transformationmatrix[i, j] = float(values[j])

# src_points = [[313, 368], [1404, 374], [1590, 929], [81, 870]]
# dst_points = [[-7, 6], [7, 7], [7, -8], [4, -8]]

src_points = [[357, 331], [1400, 354], [1591, 930], [11, 805]]
dst_points = [[1, 0], [3, 15], [15, 16], [16, 0]]

src = np.array(src_points, dtype="float32")
dst = np.array(dst_points, dtype="float32")

M = cv2.getPerspectiveTransform(src, dst)
print(M)
p = [8, 8, 1]
x, y, z = np.matmul(np.linalg.inv(M), p)
print(x / z, y / z)

exit()

# h_p = np.array([779, 535, 1])
# trans_p = np.dot(M, h_p)
# x, y = np.array([trans_p[0] / trans_p[2], trans_p[1] / trans_p[2]])
# print(x - 8, y - 8)

# M = cv2.getPerspectiveTransform(src, dst)
# h_p = np.array([590, 480, 1])
# trans_p = np.dot(M, h_p)
# x, y = np.array([trans_p[0] / trans_p[2], trans_p[1] / trans_p[2]])
# print(x - 8, y - 8)

# x, y, z = np.dot(np.linalg.inv(M), [x, y, 1])
# print(x / z, y / z)


# print("Transformed Point 4 (x, y):", transformed_x, transformed_y)


def transformXY(M, bbox) -> np.ndarray:
    x = int(bbox.get("x"))
    y = int(bbox.get("y"))
    width = int(bbox.get("width"))
    height = int(bbox.get("height"))
    x = x + width / 2
    y = y + height
    h_p = np.array([x, y, 1])
    trans_p = np.dot(M, h_p)
    p = np.array([trans_p[0] / trans_p[2], trans_p[1] / trans_p[2]])
    return p


tree = ET.parse(path)
root = tree.getroot()

for data in root:
    if data.tag == "{http://lamp.cfar.umd.edu/viper}data":
        for objects in data[0]:
            if "object" in objects.tag:
                for bbox in objects[0]:
                    x, y = transformXY(M, bbox)
                    bbox.set("x", str(x - 8))
                    bbox.set("y", str(y - 8))

tree.write("transformedTrajectories.xml")
