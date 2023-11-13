def n_points_transformation(
    self, src_points, dst_points, frame, output_size
) -> np.ndarray:
    src = np.array(src_points, dtype="float32")
    dst = np.array(dst_points, dtype="float32")
    M, mask = cv2.findHomography(src, dst, cv2.RANSAC, ransacReprojThreshold=3.0)
    self.transformation_matrix = M
    warped = cv2.warpPerspective(frame, M, output_size)
    return warped
