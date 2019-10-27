
import { Alignment, Margin} from "./geometry";
import { CompositeBox } from "./box";

export function layout(container: CompositeBox, isHorizontal: boolean,
        align: Alignment, gap: number, margin: Margin) {
    let width = 0;
    let height = 0;
    container.children.forEach(child => {
        child.layout();
        if (isHorizontal) {
            if (width > 0) {
                width += gap;
            }
            width += child.bounds.width;
            height = Math.max(height, child.bounds.height);
        } else {
            if (height > 0) {
                height += gap;
            }
            height += child.bounds.height;
            width = Math.max(width, child.bounds.width);
        }
    });
    container.bounds.width = margin.left + width + margin.right;
    container.bounds.height = margin.top + height + margin.bottom;
    let x = margin.left;
    let y = margin.top;
    container.children.forEach(child => {
        if (isHorizontal) {
            let offset = 0;
            if (align == Alignment.CENTER) {
                offset = (height - child.bounds.height) / 2;
            }
            child.setRelativePosition(x, y + offset);
            x += child.bounds.width + gap;
        } else {
            let offset = 0;
            if (align == Alignment.CENTER) {
                offset = (width - child.bounds.width) / 2;
            }
            child.setRelativePosition(x + offset, y);
            y += child.bounds.height + gap;
        }
    });
}