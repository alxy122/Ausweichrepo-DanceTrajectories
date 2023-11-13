import tkinter as tk
from tkinter import ttk
import cv2
import numpy as np
from PIL import ImageTk, Image
from threading import Thread


class VideoTransformation:
    """
    This class sets up a tkinter gui to apply perspective transformation on a video
    """

    def __init__(self, video_src, resolution) -> None:
        self.root = tk.Tk()
        self.video_src = video_src
        self.origin_video = cv2.VideoCapture(self.video_src)
        self.resolution = resolution
        self.src_points = []
        self.dest_points = []
        self.showGrid = True
        self.transform = False
        self.transformation_matrix = np.empty((3, 3))

        self.init_gui()
        self.update_frame()

        # main event loop
        self.root.mainloop()

    def init_gui(self) -> None:
        """
        Initialize GUI and event listener for buttons and image clicking
        """

        # add the clicked src points to a list
        def handle_click(event) -> None:
            x = event.x
            y = event.y
            self.src_points.append([x, y])

        # reset any points stored and stop transformation
        def reset_clicked_points() -> None:
            self.transform = False
            self.src_points = []
            self.dest_points = []

        # update the grid on value change
        def on_spinbox_change() -> None:
            user_input_width = spinbox_width.get()
            user_input_height = spinbox_height.get()
            if (
                user_input_width.isdigit()
                and user_input_height.isdigit()
                and int(user_input_width) < 100
                and int(user_input_height) < 100
                and int(user_input_width) > 0
                and int(user_input_height) > 0
            ):
                self.showTransformGrid(user_input_width, user_input_height)
            toggle_grid_button.config(text="Hide Grid")
            self.showGrid = True

        # display or remove the grid
        def toggle_grid() -> None:
            self.showGrid = not self.showGrid
            if self.showGrid:
                on_spinbox_change()
            else:
                self.right_canvas.delete("all")
                toggle_grid_button.config(text="Show Grid")

        # toggle the boolean flag for transformation
        def toggle_transform() -> None:
            self.transform = not self.transform

        # save the transformed video to file system in another thread
        def save_video() -> None:
            if self.transform:
                vc = cv2.VideoCapture(self.video_src)
                thread = Thread(target=self.save_transformed_video, args=(vc,))
                thread.start()

        def save_matrix() -> None:
            np.savetxt("matrix.txt", self.transformation_matrix)

        input_frame = tk.Frame(self.root)
        input_frame.pack(side="top")
        tk.Label(input_frame, text="tiles in x").pack(side="left")
        spinbox_width = tk.Spinbox(
            input_frame, from_=1, to=99, width=5, command=on_spinbox_change
        )
        spinbox_width.pack(side="left")
        tk.Label(input_frame, text="tiles in y").pack(side="left")
        spinbox_height = tk.Spinbox(
            input_frame, from_=1, to=99, width=5, command=on_spinbox_change
        )
        spinbox_height.pack(side="left")

        self.left_canvas = tk.Canvas(
            self.root, width=self.resolution[0], height=self.resolution[1]
        )
        self.left_canvas.pack(side="left")
        self.left_canvas.bind("<Button-1>", handle_click)
        self.right_canvas = tk.Canvas(
            self.root, width=self.resolution[1], height=self.resolution[1]
        )
        self.right_canvas.pack(side="left")

        toggle_grid_button = tk.Button(
            input_frame, text="Hide Grid", command=toggle_grid
        )
        toggle_grid_button.pack(side="right")

        clear_points_button = tk.Button(
            input_frame, text="Clear Points", command=reset_clicked_points
        )
        clear_points_button.pack(side="right")

        toggle_transform_button = tk.Button(
            input_frame, text="Transform", command=toggle_transform
        )
        toggle_transform_button.pack(side="right")

        save_video_button = tk.Button(
            input_frame, text="Save Video", command=save_video
        )
        save_video_button.pack(side="right")

        save_matrix_button = tk.Button(
            input_frame, text="Save Matrix", command=save_matrix
        )
        save_matrix_button.pack(side="right")

    def showTransformGrid(self, x, y) -> None:
        """
        This method shows the vertices of a grid of squares.
        x: int
            number of vertices in x direction
        y: int
            number of vertices in y direction
        """

        self.right_canvas.delete("all")
        canvas = self.right_canvas

        # append the clicked points to the dest_points list
        def handle_click(event):
            for point, coords in points.items():
                if (
                    coords[0] <= event.x <= coords[2]
                    and coords[1] <= event.y <= coords[3]
                ):
                    canvas.itemconfig(point_objects[point], fill="blue")
                    self.dest_points.append([coords[0] + 10, coords[1] + 10])

        canvas_width = canvas.winfo_width()
        canvas_height = canvas.winfo_width()

        coords = self.fit_squares_into_box(
            num_squares_x=int(x),
            num_squares_y=int(y),
            box_width=canvas_width,
            box_height=canvas_height,
            offset=20,
        )

        # Define the coordinates of the points
        points = {}
        radius = 10
        for i in range(len(coords)):
            point_name = f"point{i+1}"
            x0 = coords[i][0] - radius
            y0 = coords[i][1] - radius
            x1 = coords[i][0] + radius
            y1 = coords[i][1] + radius
            points[point_name] = (x0, y0, x1, y1)

        # Draw the points as small oval shapes and store their IDs
        point_objects = {}
        for point, coords in points.items():
            oval = canvas.create_oval(
                coords[0], coords[1], coords[2], coords[3], outline="", fill="red"
            )
            point_objects[point] = oval

        # Bind the callback function to the mouse click event
        canvas.bind("<Button-1>", handle_click)

    def fit_squares_into_box(
        self, num_squares_x, num_squares_y, box_width, box_height, offset
    ) -> list:
        """
        This method fits a chosen amount of squares into a bounding box with an offset applied

        num_squares_x: int
            number of squares in x direction
        num_squares_y: int
            number of squares in y direction
        box_width: int
        box_height: int
        offset: int

        returns a list all unique square vertices
        """

        if num_squares_x > num_squares_y:
            square_size = (box_width - offset * 2) / num_squares_x
        else:
            square_size = (box_height - offset * 2) / num_squares_y

        # Calculate the starting position of the squares
        start_x = (box_width - (num_squares_x * square_size)) / 2
        start_y = (box_height - (num_squares_y * square_size)) / 2

        # Generate the coordinates of the squares
        coords = []
        for i in range(num_squares_x):
            for j in range(num_squares_y):
                x = start_x + i * square_size
                y = start_y + j * square_size
                self.add_if_absent(
                    coords,
                    (
                        (x, y),
                        (x, y + square_size),
                        (x + square_size, y),
                        (x + square_size, y + square_size),
                    ),
                )
        return coords

    def add_if_absent(self, list, items) -> None:
        """
        append item to list, if not already contained
        """
        for item in items:
            if item not in list:
                list.append(item)

    def update_frame(self) -> None:
        """
        This method displays the video(s) in the tkinter canvas
        This is done by going through every frame and doing all needed conversion steps.
        If the transform flag is set, the transformed video gets displayed in the right tkinter canvas

        """
        ret, frame = self.origin_video.read()
        if frame is not None:
            # frame = cv2.resize(frame, self.resolution)

            # draw all clicked src points on each frame
            for point in self.src_points:
                cv2.circle(frame, (point[0], point[1]), 4, (0, 0, 255), -1)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame)
            img = ImageTk.PhotoImage(image=img)
            self.left_canvas.create_image(0, 0, anchor=tk.NW, image=img)
            self.left_canvas.image = img

            if self.transform:
                output_size = (self.resolution[0], self.resolution[0])
                frame_right = self.n_points_transformation(
                    self.src_points, self.dest_points, frame, output_size
                )
                img = Image.fromarray(frame_right)
                img = ImageTk.PhotoImage(image=img)
                self.right_canvas.create_image(0, 0, anchor=tk.NW, image=img)
                self.right_canvas.image = img

        self.root.after(10, self.update_frame)

    def n_points_transformation(
        self, src_points, dst_points, frame, output_size
    ) -> np.ndarray:
        """
        This method creates a transformation matrix for perspective transformation using src and dst points and RANSAC.
        Then the transformation is applied to the frame.

        src_points: list
            List of source points
        dst_points: list
            List of destination points where each corresponding source point is going to be transformed to
        frame: Frame

        returns a transformed opencv frame
        """
        width = self.origin_video.get(3)
        height = self.origin_video.get(4)
        print(width, height)
        src_points = [[313, 368], [1404, 374], [1590, 929], [81, 870]]
        src = np.array(src_points, dtype="float32")
        # print(src)

        dst_points = [[-7, 6], [7, 7], [7, -8], [4, -8]]

        dst = np.array(dst_points, dtype="float32")
        # M, mask = cv2.findHomography(src, dst, cv2.RANSAC, ransacReprojThreshold=3.0)
        M = cv2.getPerspectiveTransform(src, dst)
        self.transformation_matrix = M
        warped = cv2.warpPerspective(frame, M, output_size)
        return warped

    def scale_points(self, points, old_size, new_size):
        """
        This method transforms a set of points inside of a square into another square with different scale.
        The resulting points are relatively on the same position as in the original square.

        points: list
            List of points

        old_size: float
            width/height of original square

        new_size: float
            width/height of new square

        returns a list containing the scaled points
        """
        scale_factor = new_size / old_size
        scaled_points = []
        for x, y in points:
            scaled_x = x * scale_factor
            scaled_y = y * scale_factor
            scaled_points.append((scaled_x, scaled_y))
        return scaled_points

    def save_transformed_video(self, vc) -> None:
        """
        This method applies a transformation to a VideoCapture video and saves it to the file system
        """
        ret, frame = vc.read()
        # frameTime = 40

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        # fps = 1000 / frameTime
        fps = 24
        output_size = (1000, 1000)
        writer = cv2.VideoWriter("output.mp4", fourcc, fps, output_size)

        new_pts = self.scale_points(
            self.dest_points, self.resolution[1], output_size[1]
        )
        while ret:
            # frame = cv2.resize(frame, self.resolution)
            transformed_frame = self.n_points_transformation(
                self.src_points, new_pts, frame, output_size
            )
            writer.write(transformed_frame)

            ret, frame = vc.read()
        writer.release()

    def __del__(self) -> None:
        # free up ressources
        self.origin_video.release()


video_src = "C:/Users/alexr/OneDrive - stud.uni-stuttgart.de/Uni/8. Semester/BA/TransformVideo/ludw.mp4"
# set resolution to 16:9
resolution = np.array([1920, 1080], dtype="int")
player = VideoTransformation(video_src, resolution)
