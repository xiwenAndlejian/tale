import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

/**
 * 标题：Test<br>
 * 功能说明：测试<br>
 * 系统版本：v1.0<br>
 * 开发人员： ganxiang20970 <br>
 * 开发时间：2018年01月26日 09:12<br>
 */
public class Test {



    /*
     * @param root: The root of binary tree.
     * @return: An integer
     */
    public static int maxPathSum(TreeNode root) {
        // write your code here
        if (root == null)
            return 0;
        return root.val + getMaxSum(root.left) + getMaxSum(root.right);
    }

    //递归获取最大路径和
    private static int getMaxSum(TreeNode root) {
        if (root == null)
            return 0;
        return root.val + Math.max(getMaxSum(root.left), getMaxSum(root.right));
    }

    //子数组，截取数组
    private static int[] subArray(int[] nums, int a, int b) {
        int length = b - a + 1;
        int[] arr  = new int[length];
        for (int i = 0, j = a; i < length; i++, j++)
            arr[i] = nums[j];
        return arr;
    }

    //获取目标元素在数组中的索引
    private static int getIndex(int[] nums, int target) {
        int index = 0;
        for (int l = nums.length, i = 0; i < l; i++) {
            if (nums[i] == target) {
                index = i;
                break;
            }
        }
        return index;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(7);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.left.left.left = new TreeNode(8);
        root.left.left.right = new TreeNode(10);
        System.out.print(maxPathSum(root));
    }

    /*
     * @param root: A tree
     * @return: buttom-up level order a list of lists of integer
     */
    public List<List<Integer>> levelOrderBottom(TreeNode root) {
        // write your code here
        List<List<Integer>> rst = new ArrayList<List<Integer>>();
        if (root == null)
            return rst;
        Stack<TreeNode> nodes    = new Stack<TreeNode>();
        Stack<TreeNode> temp     = new Stack<TreeNode>();
        List<Stack<Integer>>  stackRsts = new ArrayList<Stack<Integer>>();
        Stack<Integer>  tempRst = new Stack<Integer>();
        nodes.push(root);

        while (!nodes.isEmpty()) {
            TreeNode node = nodes.pop();
            tempRst.push(node.val);
            if (node.right != null) {
                temp.push(node.right);
            }
            if (node.left != null) {
                temp.push(node.right);
            }
            if (nodes.isEmpty()) {
                nodes = temp;
                stackRsts.add(tempRst);
                tempRst = new Stack<Integer>();
            }
        }

        stackRsts.stream().forEach(x -> rst.add(stackToList(x)));
        return rst;
    }

    private static <T> List<T> stackToList(Stack<T> stack) {
        List<T> rst = new ArrayList<>();
        while (!stack.isEmpty()) {
            rst.add(stack.pop());
        }
        return rst;
    }
}
class TreeNode {
    public int val;
    public TreeNode left, right;

    public TreeNode(int val) {
        this.val = val;
        this.left = this.right = null;
    }
}
